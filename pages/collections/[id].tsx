import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Table, Descriptions, Card, Avatar, Skeleton } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
  key: React.Key;
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
  const [currentId, setCurrentId] = useState(id?.toString());
  const [table, setTable] = useState([] as DataType[]);

  useEffect(() => {
    setCurrentId(id?.toString());
    async function fetchData() {
      const collection = await getCollectionDetail(id as string)
      setDetail(collection?.collection)
      if (collection?.collection) document.title = `${collection?.collection?.name} | kiwiswap`;

      await sleep(1000);

      const listing: any = await getCollectionListings(collection?.collection.primary_asset_contracts[0].address as string)
      const rawData: DataType[] = []
      if (listing?.orders) {
        listing?.orders.map((item: any) => {
          const etherAmount = ethers.utils.formatEther(item.current_price);

          rawData.push({
            key: item.order_hash,
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
          type: "checkbox"
        }}
        columns={columns}
        dataSource={table}
      />
    </div>
  );
}
