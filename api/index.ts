import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import cors from "@koa/cors";
import multer from "koa-multer";
import session from "koa-session";
// import { uploadToSupbaseS3 } from "./s3";

const app = new Koa();
const router = new Router();
const prisma = new PrismaClient();

const SECRET_KEY = "your_secret_key"; // Will Use a secure key in production

// Session configuration
app.keys = [SECRET_KEY];
const SESSION_CONFIG = {
  key: "koa.sess",
  maxAge: 86400000, // 1 day
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: true,
  renew: false,
} as const;

// Apply session middleware
app.use(session(SESSION_CONFIG, app));

// Configure CORS with credentials
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173", // Your frontend URL
  })
);

app.use(multer().any());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Auth middleware
app.use(async (ctx, next) => {
  if (ctx.path.startsWith("/public")) {
    return await next();
  }

  if (!ctx.session?.userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }

  ctx.state.user = { id: ctx.session.userId };
  await next();
});

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

router.post("/public/signup", async (ctx) => {
  const { email, password } = ctx.request.body as {
    email: string;
    password: string;
  };

  const user = await prisma.user.findUnique({
    where: { email },
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

  if (ctx.session) {
    ctx.session.userId = newUser.id;
  }

  ctx.status = 200;
  ctx.body = {
    userId: newUser.id,
    userEmail: newUser.email,
  };
});

router.post("/public/login", async (ctx) => {
  const { email, password } = ctx.request.body as {
    email: string;
    password: string;
  };

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    ctx.status = 401;
    ctx.body = { error: "Invalid email or password" };
    return;
  }

  if (ctx.session) {
    ctx.session.userId = user.id;
  }

  ctx.body = {
    userId: user.id,
    userEmail: user.email,
  };
});

router.get("/api/check-auth", async (ctx) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.session?.userId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      ctx.session = null;
      ctx.status = 401;
      ctx.body = {
        authenticated: false,
        error: "User not found",
      };
      return;
    }

    ctx.status = 200;
    ctx.body = {
      authenticated: true,
      user: { id: user.id, email: user.email },
    };
  } catch (error) {
    ctx.session = null;
    ctx.status = 401;
    ctx.body = {
      authenticated: false,
      error: "Authentication check failed",
    };
  }
});

router.post("/api/logout", async (ctx) => {
  ctx.session = null;
  ctx.status = 200;
  ctx.body = { message: "Logged out successfully" };
});

router.get("/api/rooms", async (ctx) => {
  const userId = ctx.session?.userId;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      rooms: true,
    },
  });

  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "User not found" };
    return;
  }

  ctx.status = 200;
  const rooms = user.rooms;

  ctx.body = { rooms };

  return;
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
          email: true,
        },
      },
    },
  });

  if (!room) {
    ctx.status = 404;
    ctx.body = { error: "Room not found" };
    return;
  }

  const isAllowedAccess =
    ctx.state.user.id === room.ownerUserId ||
    room.participants.some((user) => user.id === ctx.state.user.id);

  if (!isAllowedAccess) {
    ctx.status = 403;
    ctx.body = { error: "You are not allowed to access this room" };
    return;
  }

  ctx.body = room;
  ctx.status = 200;
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

  await prisma.user.update({
    where: {
      id: ctx.session?.userId,
    },
    data: {
      rooms: { connect: { id: roomIdInt } },
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

router.post("/api/create-room", upload.single("file"), async (ctx) => {
  try {
    // const file = (ctx.req as any).files[0]; // Access the uploaded file

    // const upload = await uploadToSupbaseS3(buffer, originalname, mimetype);

    //TODO: make sure we create prisma rooms for user

    ctx.body = 200;
  } catch (error) {
    console.error("Error handling file upload:", error);
    ctx.status = 500;
    ctx.body = { error: "Failed to process file upload" };
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
