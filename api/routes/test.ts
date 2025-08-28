import Router from '@koa/router'



const routerOne = new Router()

routerOne.get('/', async (ctx)  => {
  ctx.status = 200;
  ctx.body = {
   message: 'Hello'
  };
})

export default routerOne