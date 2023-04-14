import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
  key: React.Key;
  name: string;
  price: string;
  time: string;
}

const columns: ColumnsType<DataType> = [
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
  return new Promise(async (resolve, reject) => {
    const res = await fetch(`http://localhost:3000/api/collections/${name}`)
    const data = await res.json()
    resolve(data)
  });
}

const getCollectionListings = async (name: string) => {
  return new Promise(async (resolve, reject) => {
    const res = await fetch(`http://localhost:3000/api/collections/${name}/listings`)
    const data = await res.json()
    resolve(data)
  });
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

export default function Collections() {
  const router = useRouter();
  const { id } = router.query;
  const [currentId, setCurrentId] = useState(id?.toString());
  const [table, setTable] = useState([] as DataType[]);

  useEffect(() => {
    setCurrentId(id?.toString());
    async function fetchData() {
      const listing: any = await getCollectionListings(id as string)
      const collection = await getCollectionDetail(id as string)
      const rawData: DataType[] = []
      if (listing?.listings) {
        listing?.listings.map((item: any) => {
          const etherAmount = ethers.formatEther(item.price.current.value);

          rawData.push({
            key: item.order_hash,
            name: `${id}#${item.protocol_data.parameters.offer[0].identifierOrCriteria}`,
            price: etherAmount,
            time: formatTimestamp(item.protocol_data.parameters.startTime)
          })
        })
      }
      setTable(rawData)
    }
    id && fetchData();
  }, [id]);

  return (
    <div>
      <Table
        rowSelection={{
          type: "checkbox"
        }}
        columns={columns}
        dataSource={table}
      />
    </div>
  );
}
