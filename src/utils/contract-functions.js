import { publicClient } from './constants'

import abi from '../abi.json'
import newAbi from '../portal-contract-abi.json'

export const getLegacyPortalFileCount = async (contractAddress) => {
  const count = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: 'getFileCount',
  })

  return Number(count)
}

export const getNewPortalFileCount = async (contractAddress) => {
  const count = await publicClient.readContract({
    address: contractAddress,
    abi: newAbi,
    functionName: 'getFileCount',
  })

  return Number(count)
}

export const getLegacyContractFile = async (fileId, contractAddress) => {
  const [metadataHash, contentHash] = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: 'files',
    args: [fileId],
  })

  return { metadataHash, contentHash }
}

export const getNewContractFile = async (fileId, contractAddress) => {
  const details = await publicClient.readContract({
    address: contractAddress,
    abi: newAbi,
    functionName: 'files',
    args: [fileId],
  })
  return details
}

export const getPortalKeysVerifiers = async (contractAddress) => {
  return await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: 'keyVerifiers',
    args: [0],
  })
}

export const getNewPortalKeysVerifiers = async (contractAddress) => {
  return await publicClient.readContract({
    address: contractAddress,
    abi: newAbi,
    functionName: 'keyVerifiers',
    args: [0],
  })
}

// Post-quantum ring entries live at their own verifier index (the entry's
// `version`); an upgraded portal keeps its EC pair at 0.
export const getNewPortalKeysVerifiersAt = async (contractAddress, version) => {
  return await publicClient.readContract({
    address: contractAddress,
    abi: newAbi,
    functionName: 'keyVerifiers',
    args: [version],
  })
}
