import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";

import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import koajwt from "koa-jwt";
import bcrypt from "bcrypt";
import cors from "@koa/cors";
import multer from "koa-multer";
import { uploadToSupbaseS3 } from "./s3";

const app = new Koa();
const router = new Router();
const prisma = new PrismaClient();

const SECRET_KEY = "your_secret_key"; // Will Use a secure key in production

app.use(cors());
app.use(multer().any());

const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

app.use(koajwt({ secret: SECRET_KEY }).unless({ path: [/^\/public/] }));

app.use(async (ctx, next) => {
  if (ctx.path === "/api/create-room") {
    await next();
    return;
  }

  await bodyParser({
    enableTypes: ["json"],
    jsonLimit: "100mb",
  })(ctx, next);
});

app.use(async (ctx, next) => {
  ctx.state.user = null;
  await next();
});

router.post("/public/signup", async (ctx) => {
  const { email, password } = ctx.request.body as {
    email: string;
    password: string;
  };

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    ctx.status = 400;
    ctx.body = { error: "User already exists" };
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  ctx.status = 200;

  const token = jwt.sign({ id: newUser.id }, SECRET_KEY, {
    expiresIn: "1h",
  });

  ctx.body = { token, userId: newUser.id, userEmail: newUser.email };
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

  ctx.body = { token, userId: user.id, userEmail: user.email };
});

router.get("/api/:userId/rooms", async (ctx) => {
  const userId = ctx.params.userId;

  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(userId),
    },
    select: {
      rooms: {
        select: {
          id: true,
          name: true,
          participants: {
            select: {
              id: true,
              email: true,
            },
          },
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

router.get("/api/room/:roomId", async (ctx) => {
  const roomId = ctx.params.roomId;

  const room = await prisma.room.findUnique({
    where: {
      id: parseInt(roomId),
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

router.post(
  "/api/create-room",
  upload.single("file"), // 'file' should match the field name in your FormData
  async (ctx) => {
    try {
      const file = (ctx.req as any).files[0]; // Access the uploaded file

      const { buffer, originalname, mimetype } = file;

      const upload = await uploadToSupbaseS3(buffer, originalname, mimetype);

      console.log(upload);

      ctx.body = 200;
    } catch (error) {
      console.error("Error handling file upload:", error);
      ctx.status = 500;
      ctx.body = { error: "Failed to process file upload" };
    }
  }
);

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
