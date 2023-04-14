// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { address } = req.query;
  const request = { "query": "query GetNFTsOwnedBySharathkrml {\n  TokenBalances(\n    input: {filter: {owner: {_eq: \"" + address + "\"}, tokenType: {_in: [ERC721]}}, blockchain: polygon, limit: 10}\n  ) {\n    TokenBalance {\n      tokenType\n      tokenNfts {\n        tokenId\n        tokenURI\n        address\n        metaData {\n          name\n          image\n        }\n      }\n    }\n  }\n}", "operationName": "GetNFTsOwnedBySharathkrml" }
  const response = await fetch("https://api.airstack.xyz/gql", {
    "headers": {
      "accept": "application/json, multipart/mixed",
      "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6",
      "content-type": "application/json",
      "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    "referrer": "https://app.airstack.xyz/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": JSON.stringify(request),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  });
  const json = await response.json();
  res.status(200).json(json)
}