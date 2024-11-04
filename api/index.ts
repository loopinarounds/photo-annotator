import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import koajwt from "koa-jwt";
import bcrypt from "bcrypt";

const app = new Koa();
const router = new Router();
const prisma = new PrismaClient();

const SECRET_KEY = "your_secret_key"; // Will Use a secure key in production

app.use(bodyParser());

app.use(async function (ctx, next) {
  return next().catch((err) => {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.body = "Protected resource, use Authorization header to get access\n";
    } else {
      throw err;
    }
  });
});

app.use(function (ctx, next) {
  if (ctx.url.match(/^\/public/)) {
    ctx.body = "unprotected\n";
  } else {
    return next();
  }
});

// unprotected middleware here

router.post("/signup", async (ctx) => {
  const { email, password } = ctx.request.body as {
    email: string;
    password: string;
  };
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user to the database
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  ctx.body = { message: "User registered successfully" };
});

router.post("/login", async (ctx) => {
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
  ctx.body = { token }; // Send the token and userId back to the client to send to local storage
});

app.use(koajwt({ secret: "shared-secret" }));

//  protected middleware here

router.get("/", async (_ctx) => {});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
