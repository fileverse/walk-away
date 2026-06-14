import { getIPFSAsset } from './ipfs-utils'
import { toAesKey } from './crypto'
import { toUint8Array } from 'js-base64'
import { aesDecrypt } from '@fileverse/crypto/webcrypto'

export const reconstructGateMetadata = async (
  metadataIpfsHash,
  gateIpfsHash
) => {
  const promises = []
  if (metadataIpfsHash) {
    promises.push(getIPFSAsset({ ipfsHash: metadataIpfsHash }))
  }
  if (gateIpfsHash) {
    promises.push(getIPFSAsset({ ipfsHash: gateIpfsHash }))
  }

  const [metadataResult, gateResult] = await Promise.all(promises)

  return {
    ...metadataResult.data,
    linkLock: gateResult?.data,
  }
}

export const decryptTitleWithFileKey = async (encryptedTitle, fileKey) => {
  const key = await toAesKey(toUint8Array(fileKey))
  if (!key) throw new Error('Key is undefined')
  const encryptedData = toUint8Array(encryptedTitle)
  const decryptedData = await aesDecrypt(key, encryptedData)
  return new TextDecoder().decode(decryptedData)
}
