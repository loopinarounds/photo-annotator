import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
// import { PrismaClient } from "@prisma/client";

const app = new Koa();
const router = new Router();
// const prisma = new PrismaClient();

app.use(bodyParser());

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
