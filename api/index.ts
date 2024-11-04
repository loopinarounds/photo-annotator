import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import koajwt from "koa-jwt";
import bcrypt from "bcrypt";
import cors from "@koa/cors";

const app = new Koa();
const router = new Router();
const prisma = new PrismaClient();

const SECRET_KEY = "your_secret_key"; // Will Use a secure key in production

app.use(bodyParser());
app.use(cors());
app.use(koajwt({ secret: SECRET_KEY }).unless({ path: [/^\/public/] }));

// Signup route
router.post("/public/signup", async (ctx) => {
  const { email, password } = ctx.request.body as {
    email: string;
    password: string;
  };

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  ctx.body = { message: "Signup successful" };
  ctx.status = 200;
});

router.post("/public/login", async (ctx) => {
  const { email, password } = ctx.request.body as {
    email: string;
    password: string;
  };
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    ctx.status = 401;
    ctx.body = { error: "Invalid email or password" };
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    ctx.status = 401;
    ctx.body = { error: "Invalid email or password" };
    return;
  }

  const token = jwt.sign({ id: user.id }, SECRET_KEY, {
    expiresIn: "1h",
  });
  ctx.body = { token, userId: user.id };
});

router.get("/api/rooms", async (ctx) => {
  const userId = ctx.state.user.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      rooms: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "User not found" };
    return;
  }

  ctx.status = 200;
  const rooms = user.rooms;

  ctx.body = rooms;
});

router.post("/api/create-room", async (ctx) => {
  const userId = ctx.state.user.id;
  const { name } = ctx.request.body as { name: string };

  const room = await prisma.room.create({
    data: {
      name,
      ownerUserId: userId,
      image: "test",
      liveblocksRoomId: "test",
    },
  });

  if (!room) {
    ctx.status = 500;
    ctx.body = { error: "Error creating room" };
    return;
  }

  ctx.status = 200;
  ctx.body = room;
});

router.get("/api/room/:roomId", async (ctx) => {
  const roomId = ctx.params.roomId;

  const roomIdInt = parseInt(roomId);

  const room = await prisma.room.findUnique({
    where: {
      id: roomIdInt,
    },
    include: {
      participants: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!room) {
    ctx.status = 404;
    ctx.body = { error: "Room not found" };
    return;
  }

  if (
    ctx.state.user.id !== room.ownerUserId ||
    !room.participants.find((user) => user.id === ctx.state.user.id)
  ) {
    ctx.status = 403;
    ctx.body = { error: "You are not allowed to access this room" };
    return;
  }

  ctx.status = 200;
  ctx.body = room;
});

router.post("/api/:roomId/invite-to-room", async (ctx) => {
  const { email } = ctx.request.body as { email: string };
  const roomId = ctx.params.roomId;

  const roomIdInt = parseInt(roomId);

  const room = await prisma.room.update({
    where: {
      id: roomIdInt,
    },
    data: {
      participants: {
        connect: {
          email,
        },
      },
    },
  });

  if (!room) {
    ctx.status = 404;
    ctx.body = { error: "Room not found" };
    return;
  }

  ctx.status = 200;
  ctx.body = room;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
