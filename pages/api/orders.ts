// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { BigNumber, ethers } from "ethers";
import path from 'path';
import { promises as fs } from 'fs';


interface Token {
  token_id: number;
  price: number;
  platform: number;
}

type Request = {
  contract_address: string;
  tokens: Token[];
};


type Response = {
  value: string;
  calldata: string;
  address: string;
}

const CONTRACT_ADDRESS = "0xDeB7540Ae5d0F724a8f0ab6cac49F73a3DebA2f3";

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  const request: Request = req.body;
  const orders = await getOpenseaOrders(request);
  let value = BigNumber.from(0);

  const abiDirectory = path.join(process.cwd(), "abis");

  const seaportProxyAbi = await fs.readFile(abiDirectory + "/SeaportProxy.json", "utf8");
  const seaportIface = new ethers.utils.Interface(seaportProxyAbi)
  const kiwiswapAbi = await fs.readFile(abiDirectory + "/Kiwiswap.json", "utf8");
  const kiwiswapIface = new ethers.utils.Interface(kiwiswapAbi);

  const tradeDetails = [];
  for (const order of orders) {
    const basicOrderParameters = await getBasicOrderParametersFromOrder(order);
    const calldata = seaportIface.encodeFunctionData("buyAssetsForEth", [[basicOrderParameters]]);
    tradeDetails.push({ marketId: 0, value: order.current_price, tradeData: calldata });
    value = value.add(BigNumber.from(order.current_price));
  }

  const calldata = kiwiswapIface.encodeFunctionData("batchBuyWithETH", [tradeDetails]);

  res.status(200).json({ value: value.toString(), calldata: calldata, address: CONTRACT_ADDRESS })
}

export const getOpenseaOrders = async (request: Request) => {
  let requestUrl = `https://testnets-api.opensea.io/v2/orders/goerli/seaport/listings?asset_contract_address=${request.contract_address}&limit=50&order_by=eth_price&order_direction=asc&format=json`;
  for (const token of request.tokens) {
    requestUrl = requestUrl + "&token_ids=" + token.token_id;
  }
  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const json = await response.json();
  return json.orders;
}

const getBasicOrderParametersFromOrder = async (order) => {
  const request = {
    listing: {
      hash: order.order_hash,
      chain: "goerli",
      protocol_address: order.protocol_address,
    },
    fulfiller: {
      address: CONTRACT_ADDRESS
    }
  };

  const response = await fetch("https://testnets-api.opensea.io/v2/listings/fulfillment_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request)
  });


  const res = await response.json();
  return res.fulfillment_data.transaction.input_data.parameters;
}
