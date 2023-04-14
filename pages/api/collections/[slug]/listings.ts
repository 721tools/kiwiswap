// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { slug } = req.query
  const response = await fetch(`https://testnets-api.opensea.io/v2/listings/collection/${slug}/all?format=json`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const json = await response.json();
  res.status(200).json(json)
}
