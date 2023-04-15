import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Table, Descriptions, Card, Avatar, Skeleton, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
  key: React.Key;
  id: string;
  img: string;
  name: string;
  price: string;
  time: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: '',
    dataIndex: 'img',
    width: 100,
    render: (src: string) => <Avatar shape="square" size={64} src={src} />,
  },
  {
    title: 'Name',
    dataIndex: 'name'
  },
  {
    title: 'Price',
    dataIndex: 'price',
  },
  {
    title: 'Time',
    dataIndex: 'time',
  }
];

const getCollectionDetail = async (name: string) => {
  const res = await fetch(`/api/collections/${name}`)
  const data = await res.json()

  return data
}

const getCollectionListings = async (address: string) => {
  const res = await fetch(`/api/collections/${address}/listings`)
  const data = await res.json()

  return data
}

const postCollectionListings = async (address, array) => {
  const body = {
    contract_address: address,
    tokens: []
  };
  array.map(item => {
    body.tokens.push({
      token_id: item.id,
      price: item.price,
      "platform": 0
    })
  })

  const res = await fetch('/api/orders/sweep', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  console.log(data)
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(parseInt(timestamp) * 1000);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const formattedTime = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return formattedTime
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function Collections() {
  const router = useRouter();
  const { id } = router.query;
  const [detail, setDetail] = useState({});
  const [address, setAddress] = useState("");
  const [wallet, setWallet] = useState("");
  const [select, setSelect] = useState([]);
  const [currentId, setCurrentId] = useState(id?.toString());
  const [table, setTable] = useState([] as DataType[]);

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      setSelect(selectedRows)
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record: DataType) => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  };

  const connectWallet = async () => {
    // Connect to the user's MetaMask wallet
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Request access to the user's MetaMask account
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      // Use the provider to interact with the blockchain
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWallet(address);
      console.log(`Connected to MetaMask wallet with address ${address}`);
    } else {
      console.log('MetaMask wallet not detected');
    }
  }

  useEffect(() => {
    setCurrentId(id?.toString());
    async function fetchData() {
      const collection = await getCollectionDetail(id as string)
      setDetail(collection?.collection)
      if (collection?.collection) document.title = `${collection?.collection?.name} | kiwiswap`;
      setAddress(collection?.collection.primary_asset_contracts[0].address as string)

      await sleep(1000);

      const listing: any = await getCollectionListings(collection?.collection.primary_asset_contracts[0].address as string)
      const rawData: DataType[] = []
      if (listing?.orders) {
        listing?.orders.map((item: any) => {
          const etherAmount = ethers.utils.formatEther(item.current_price);

          rawData.push({
            key: item.order_hash,
            id: item.protocol_data.parameters.offer[0].identifierOrCriteria,
            img: item.maker.profile_img_url,
            name: `${id} #${item.protocol_data.parameters.offer[0].identifierOrCriteria}`,
            price: etherAmount,
            time: formatTimestamp(item.protocol_data.parameters.startTime)
          })
        })
      }
      setTable(rawData.sort((a, b) => {
        return ethers.utils.parseEther(a.price).lt(ethers.utils.parseEther(b.price)) ? -1 : 1;
      }))
    }
    id && fetchData();
  }, [id]);

  return (
    <div className="w-11/12 m-auto">
      {/* <Button type="primary" size="large"
        onClick={() => connectWallet()}
      >
        {wallet || "ConnectWallet"}
      </Button> */}

      <Button type="primary" disabled={!select || select.length <= 0} size="large" onClick={() => postCollectionListings(address, select)}>
        BUY
      </Button>
      {detail?.name
        ? <Card bordered={false}>
          <Avatar
            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
            src={detail?.image_url}
          />
          <Descriptions title={detail?.name}>
            <Descriptions.Item label="Floor Price">{detail?.stats?.floor_price}</Descriptions.Item>
          </Descriptions>
        </Card>
        : <div className="bg-white p-5">
          <Skeleton active />
        </div>}

      <Table
        className="bg-white mt-5"
        rowSelection={{
          type: "checkbox",
          ...rowSelection,
        }}
        columns={columns}
        dataSource={table}
      />
    </div>
  );
}
