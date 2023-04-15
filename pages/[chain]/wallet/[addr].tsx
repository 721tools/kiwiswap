import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';
import { Table, Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ethers } from 'ethers';

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
  console.log(chain, addr)

  const [select, setSelect] = useState([]);
  const [address, setAddress] = useState("");
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

  useEffect(() => {
    setAddress(addr as string);
    async function fetchData() {
      const assets: any = await getWalletAsset(addr as string)

      const rawData: DataType[] = []
      if (assets?.data) {
        assets?.data.TokenBalances.TokenBalance.map((item: any) => {
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
    addr && fetchData();
  }, [addr]);

  return (
    <div className="w-11/12 m-auto">
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
