import Koa from "koa";
import bodyParser from "koa-bodyparser";

import cors from "@koa/cors";
import Router from "koa-router";


const app = new Koa();

const router = new Router()


app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

app.use(async (ctx, next) => {
  if (ctx.path.startsWith("/public")) {
    return await next();
  }

  await next();
});

app.use(async (ctx, next) => {

  await bodyParser({
    enableTypes: ["json"],
    jsonLimit: "100mb",
  })(ctx, next);
});

router.get('/api/test', async (ctx)  => {
  ctx.status = 200;
  ctx.body = {
   message: 'Hello dweeb'
  };
})



app.use(router.routes()).use(router.allowedMethods());


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000", router);
});


