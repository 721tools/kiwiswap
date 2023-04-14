const Koa = require('koa');
const httpRouter = require('./routes');
const cors = require('koa2-cors');
const bodyParser = require('koa-body-parser');

require('./config/env');

const app = new Koa();
const port = process.env.SERVER_PORT || 3000;


app.use(cors());
app.use(bodyParser());


app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`);
  await next();
});

app.use(async (ctx, next) => {
  const start = new Date().getTime();
  await next();
  const ms = new Date().getTime() - start;
  console.log(`Time: ${ms}ms`);
});


app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    // will only respond with JSON
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      error: 500,
      errorMessage: err.message
    };
  }
})

app.use(httpRouter.routes()).use(httpRouter.allowedMethods());

app.listen(port);

console.log(`server start at http://localhost:${port}/`);