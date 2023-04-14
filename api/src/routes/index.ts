const Router = require('koa-router');

const collections = require('./collections');


const router = new Router();

router.use('/api/collections', collections.routes(), collections.allowedMethods());

module.exports = router;