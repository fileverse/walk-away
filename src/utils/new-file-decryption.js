import { withRetry, fetchFromIPFS, FAILED_IPFS_FETCH_ERROR } from './ipfs-utils'
import { toUint8Array } from 'js-base64'
import { Buffer } from 'buffer'
import { setPenumbraWorkerLocation, getPenumbra } from './crypto'
import { decompressDsheetContentIfNeeded } from './dsheet-content-compression'

export const fetchNewFileResponse = async (contentIpfsHash) => {
  const fetchedResponse = await withRetry(
    () => fetchFromIPFS(contentIpfsHash),
    2
  )

  if (!fetchedResponse || !fetchedResponse.body)
    throw new Error(FAILED_IPFS_FETCH_ERROR)

  return fetchedResponse
}

const extractEncryptionMetadataV2 = (encryptedFileData) => {
  // Validate minimum file size (at least authTag + IV = 28 bytes)
  if (encryptedFileData.length < 28) {
    throw new Error('Invalid encrypted file format: too small')
  }

  // DSheets pattern: [Encrypted Data] + [AuthTag (16 bytes)] + [IV (12 bytes)]
  const iv = encryptedFileData.slice(-12) // Last 12 bytes
  const authTag = encryptedFileData.slice(-28, -12) // 16 bytes before IV
  const encryptedData = encryptedFileData.slice(0, -28) // Everything else

  return { encryptedData, authTag, iv }
}

export const decryptNewFile = async (fileKey, response) => {
  if (!fileKey || fileKey.trim().length === 0) {
    throw new Error('Empty fileKey provided to decryptNewFile')
  }

  if (!response.body) {
    throw new Error(FAILED_IPFS_FETCH_ERROR)
  }

  try {
    const responseArrayBuffer = await response.clone().arrayBuffer()
    const encryptedFileData = new Uint8Array(responseArrayBuffer)

    // Extract metadata from DSheets-compatible format: [Encrypted Data] + [AuthTag] + [IV]
    const { encryptedData, authTag, iv } =
      extractEncryptionMetadataV2(encryptedFileData)

    // Convert base64 key to Uint8Array
    const keyBytes = toUint8Array(fileKey)

    const decryptionInfo = {
      key: Buffer.from(keyBytes),
      iv: Buffer.from(iv),
      authTag: Buffer.from(authTag),
    }

    const penumbraEncryptedFile = {
      id: 0,
      stream: new Response(encryptedData).body,
      size: encryptedData.length,
    }

    await setPenumbraWorkerLocation()
    const penumbra = getPenumbra()
    if (!penumbra) {
      throw new Error('Penumbra is not initialized')
    }

    const [decryptedFileContent] = await penumbra.decrypt(
      decryptionInfo,
      penumbraEncryptedFile
    )

    const contentBlob = await penumbra.getBlob(decryptedFileContent)
    const contentText = await contentBlob.text()

    if (!contentText.trim()) {
      return { file: {} }
    }

    const parsedContent = JSON.parse(contentText)

    // Ensure consistent return format - if it's already wrapped with "file" key, return as is
    // Otherwise wrap it with "file" key to match expected structure.
    // Published dSheet files store a `gz1:` gzip envelope in `.file`; inflate it
    // back to raw base64 Yjs before the editor consumes it. Non-`gz1:` values
    // (ddoc content, legacy dsheets) pass through unchanged.
    if (parsedContent.file) {
      return {
        ...parsedContent,
        file: decompressDsheetContentIfNeeded(parsedContent.file),
      }
    } else {
      return { file: decompressDsheetContentIfNeeded(parsedContent) }
    }
  } catch (error) {
    console.error('Penumbra decryption failed:', error)
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
