import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import cors from "@koa/cors";
import multer from "koa-multer";
import session from "koa-session";
import { Liveblocks } from "@liveblocks/node";

import { uploadToSupbaseS3 } from "./s3";

const app = new Koa();
const router = new Router();
const prisma = new PrismaClient();

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

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

app.use(session(SESSION_CONFIG, app));

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

app.use(multer().any());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

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

router.post("/api/liveblocks-auth", async (ctx) => {
  try {
    console.log("Auth request for user ID:", ctx.session?.userId);

    const user = await prisma.user.findUnique({
      where: { id: ctx.session?.userId },
      include: {
        rooms: {
          include: {
            participants: true,
          },
        },
        participatingRooms: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!user) {
      console.log("User not found");
      ctx.status = 404;
      ctx.body = { error: "User not found" };
      return;
    }

    console.log("User found:", {
      id: user.id,
      liveblocksUserId: user.liveblocksUserId,
      roomCount: user.rooms.length + user.participatingRooms.length,
    });

    const session = liveblocks.prepareSession(user.liveblocksUserId, {
      userInfo: {
        name: user.email,
        email: user.email,
      },
    });

    user.rooms.forEach((room) => {
      console.log("Granting access to owned room:", {
        roomId: room.id,
        liveblocksRoomId: room.liveblocksRoomId,
        ownerUserId: room.ownerUserId,
        currentUserId: user.id,
      });

      session.allow(room.liveblocksRoomId, session.FULL_ACCESS);
    });

    user.participatingRooms.forEach((room) => {
      console.log("Granting access to participating room:", {
        roomId: room.id,
        liveblocksRoomId: room.liveblocksRoomId,
        ownerUserId: room.ownerUserId,
        currentUserId: user.id,
      });

      session.allow(room.liveblocksRoomId, session.FULL_ACCESS);
    });

    const { status, body } = await session.authorize();
    console.log("Liveblocks auth response:", { status, body });

    ctx.status = status;
    ctx.body = body;
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    ctx.status = 500;
    ctx.body = { error: "Failed to authenticate with Liveblocks" };
  }
});
router.post("/api/room/:roomId/annotations", async (ctx) => {
  try {
    const roomId = parseInt(ctx.params.roomId);
    const { annotations } = ctx.request.body as {
      annotations: Array<{
        x: number;
        y: number;
        text: string;
        authorId: string;
        createdAt: number;
      }>;
    };

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        OR: [
          { ownerUserId: ctx.session?.userId },
          { participants: { some: { id: ctx.session?.userId } } },
        ],
      },
    });

    if (!room) {
      ctx.status = 403;
      ctx.body = { error: "Access denied or room not found" };
      return;
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        annotations: {
          createMany: {
            data: annotations.map((ann) => ({
              x: ann.x,
              y: ann.y,
              text: ann.text,
              authorId: parseInt(ann.authorId),
              createdAt: new Date(ann.createdAt),
            })),
          },
        },
        updatedAt: new Date(),
      },
      include: {
        annotations: true,
      },
    });

    ctx.status = 200;
    ctx.body = {
      message: "Annotations saved successfully",
      annotations: updatedRoom.annotations,
    };
  } catch (error) {
    console.error("Error saving annotations:", error);
    ctx.status = 500;
    ctx.body = { error: "Failed to save annotations" };
  }
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

  const liveblocksUserId = `user-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      liveblocksUserId: liveblocksUserId,
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
      participatingRooms: true,
    },
  });

  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "User not found" };
    return;
  }

  ctx.status = 200;

  const rooms = [...user.rooms, ...user.participatingRooms];

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

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "User not found" };
    return;
  }

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
      participatingRooms: { connect: { id: roomIdInt } },
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
    const file = (ctx.req as any).files[0];

    const buffer = file.buffer;
    const originalname = file.originalname;
    const roomName = file.roomName;

    const upload = await uploadToSupbaseS3(buffer, originalname);

    const fileUrl = `https://trgnfinfuhvsvmfoxqtj.supabase.co/storage/v1/object/public/Images/${originalname}`;

    if (!upload) {
      ctx.status = 500;
      ctx.body = { error: "Failed to upload file to S3" };
      return;
    }

    await prisma.room.create({
      data: {
        imageUrl: fileUrl,
        name: roomName,
        liveblocksRoomId: `room-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`,
        ownerUserId: ctx.session?.userId,
      },
    });

    ctx.body = 200;
  } catch (error) {
    console.error("Error handling file upload:", error);
    ctx.status = 500;
    ctx.body = { error: "Failed to process file upload" };
  }
});

router.post("/api/room/:roomId/annotations", async (ctx) => {
  try {
    const roomId = parseInt(ctx.params.roomId);
    const userId = ctx.session?.userId;
    const { annotations } = ctx.request.body as {
      annotations: Array<{
        x: number;
        y: number;
        text: string;
        authorId: string;
        createdAt: number;
      }>;
    };

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        OR: [
          { ownerUserId: userId },
          { participants: { some: { id: userId } } },
        ],
      },
    });

    if (!room) {
      ctx.status = 403;
      ctx.body = { error: "Access denied or room not found" };
      return;
    }

    // doing this because of issues with annotation Ids in updateMany, in future I would change this
    const updatedAnnotations = await prisma.$transaction(async (tx) => {
      await tx.annotation.deleteMany({
        where: { roomId },
      });

      return tx.annotation.createMany({
        data: annotations.map((ann) => ({
          x: ann.x,
          y: ann.y,
          text: ann.text,
          authorId: parseInt(ann.authorId),
          roomId,
          createdAt: new Date(ann.createdAt),
          updatedAt: new Date(),
        })),
      });
    });

    ctx.status = 200;
    ctx.body = {
      message: "Annotations saved successfully",
      count: updatedAnnotations.count,
    };
  } catch (error) {
    console.error("Error saving annotations:", error);
    ctx.status = 500;
    ctx.body = { error: "Failed to save annotations" };
  }
});

router.get("/api/room/:roomId/annotations", async (ctx) => {
  try {
    const roomId = parseInt(ctx.params.roomId);
    const userId = ctx.session?.userId;

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        OR: [
          { ownerUserId: userId },
          { participants: { some: { id: userId } } },
        ],
      },
    });

    if (!room) {
      ctx.status = 403;
      ctx.body = { error: "Access denied or room not found" };
      return;
    }

    const annotations = await prisma.annotation.findMany({
      where: {
        roomId,
      },
      include: {
        author: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    ctx.status = 200;
    ctx.body = annotations;
  } catch (error) {
    console.error("Error fetching annotations:", error);
    ctx.status = 500;
    ctx.body = { error: "Failed to fetch annotations" };
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
