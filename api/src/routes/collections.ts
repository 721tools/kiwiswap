import Router from 'koa-router';
import { gotScraping } from 'got-scraping';

const CollectionsRouter = new Router({})


CollectionsRouter.get("/:slug", async (ctx) => {
  const slug = ctx.params.slug;
  const response = await gotScraping({
    url: `https://testnets-api.opensea.io/api/v1/collection/${slug}?format=json`,
  });
  ctx.body = response.body;
});



module.exports = CollectionsRouter;