import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

const useWalletAddress = () => {
  const [address, setAddress] = useState('')

  useEffect(() => {
    const getWalletAddress = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        await window.ethereum.request({ method: 'eth_requestAccounts' })

        const signer = provider.getSigner()
        const address = await signer.getAddress()
        setAddress(address)
        console.log(`Connected to MetaMask wallet with address ${address}`)
      } else {
        console.log('MetaMask wallet not detected')
      }
    }

    getWalletAddress()
  }, [])

  return address
}

export default useWalletAddress
