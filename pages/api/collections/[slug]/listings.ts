// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { slug } = req.query
  let requestUrl = `https://testnets-api.opensea.io/v2/orders/goerli/seaport/listings?asset_contract_address=${slug}&limit=50&order_by=eth_price&order_direction=asc&format=json`;
  for (const token of Array.from({ length: 10 }, (_, i) => i)) {
    requestUrl = requestUrl + "&token_ids=" + token;
  }
  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const json = await response.json();
  res.status(200).json(json.orders)
}
