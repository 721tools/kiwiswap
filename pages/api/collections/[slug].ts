// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { slug } = req.query
  const response = await fetch(`https://testnets-api.opensea.io/api/v1/collection/${slug}`, {
    method: 'GET',
  })
  const json = await response.json();
  res.status(200).json(json)
}