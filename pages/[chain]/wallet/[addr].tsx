import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';
import { Table, Descriptions, Card, Avatar, Skeleton, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ethers } from 'ethers';
import useWalletAddress from '../../../hooks/useWalletAddress';

interface DataType {
  key: React.Key;
  id: string;
  img: string;
  name: string;
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
  }
];

const getWalletAsset = async (address: string) => {
  const res = await fetch(`/api/tokens?address=${address}`)
  const data = await res.json()

  return data
}

export default function Wallet() {
  const router = useRouter();
  const { chain, addr } = router.query;

  const [select, setSelect] = useState([]);
  const [table, setTable] = useState([] as DataType[]);

  const address = useWalletAddress();

  const displayName = name => {
    if (!name) {
      return 'Anonymous'
    }
    return name.substring(0, 4) + '...' + name.substring(name.length - 4)
  }

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      setSelect(selectedRows)
    },
    getCheckboxProps: (record: DataType) => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  };

  useEffect(() => {
    async function fetchData() {
      const assets: any = await getWalletAsset(addr as string)

      const rawData: DataType[] = []
      if (assets?.data) {
        assets?.data?.TokenBalances?.TokenBalance.map((item: any) => {
          rawData.push({
            key: item.tokenNfts.tokenId,
            id: item.tokenNfts.tokenId,
            img: item.tokenNfts.metaData.image,
            name: item.tokenNfts.metaData.name,
          })
        })
      }
      setTable(rawData)
    }
    address && fetchData();
  }, [address]);

  return (
    <div className="w-11/12 m-auto">
      <div className="flex justify-end mb-3">
        <Button type="primary" size="large">
          {address ? displayName(address) : "Connect Your Wallet"}
        </Button>
      </div>
      {address
        ? <Card bordered={false}>
          <Skeleton active />
          {/* <Avatar
            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
            src={detail?.image_url}
          /> */}
          {/* <Descriptions title={detail?.name}>
            <Descriptions.Item label="Floor Price">{detail?.stats?.floor_price}</Descriptions.Item>
          </Descriptions> */}
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
  )
}
