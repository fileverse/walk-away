import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  validateKey,
  InvalidRecoveryJsonError,
  InvalidSourceError,
} from '../utils/validate-keys'
import { usePortalProvider } from '../providers/portal-provider'
import {
  getLegacyPortalFileCount,
  getNewPortalFileCount,
} from '../utils/contract-functions'
import { splitBackupKeys } from '../utils/get-portal-keys'
import { verifyLegacyKeys, verifyNewKeys } from '../utils/verify-keys'

const useUpload = () => {
  const navigate = useNavigate()
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [uploadState, setUploadState] = useState(null) // 'uploading', 'uploaded', 'failed', 'incorrect', invalid-source
  const inputRef = useRef(null)
  const { setPortalInformation, portalInformation } = usePortalProvider()

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const verifyKeys = async (oldBackupKeys, newBackupKeysArray) => {
    let newPortalAddresses = []
    let newKeysVerified = false
    let legacyKeysVerified = false
    let legacyPortalAddress = null
    let legacyOwnerPrivateKey = null

    if (Object.keys(oldBackupKeys).length > 0) {
      const {
        portalAddress,
        ownerPrivateKey,
        legacyKeysVerified: legacyKeysVerifiedResult,
      } = await verifyLegacyKeys(oldBackupKeys)
      legacyKeysVerified = legacyKeysVerifiedResult
      legacyPortalAddress = portalAddress
      legacyOwnerPrivateKey = ownerPrivateKey
      if (!legacyKeysVerified) {
        setUploadState('incorrect')
        return
      }
    }

    if (Array.isArray(newBackupKeysArray) && newBackupKeysArray.length > 0) {
      // Verify all new backup keys
      const verificationResults = await Promise.all(
        newBackupKeysArray.map(async (newBackupKeys) => {
          const { portalAddress, newKeysVerified: newKeysVerifiedResult } =
            await verifyNewKeys(newBackupKeys)
          return {
            portalAddress,
            newKeysVerified: newKeysVerifiedResult,
          }
        })
      )

      // Check if all keys are verified
      const allVerified = verificationResults.every(
        (result) => result.newKeysVerified
      )

      if (!allVerified) {
        setUploadState('incorrect')
        return
      }

      newKeysVerified = true
      newPortalAddresses = verificationResults.map(
        (result) => result.portalAddress
      )
    } else if (
      newBackupKeysArray &&
      Object.keys(newBackupKeysArray).length > 0
    ) {
      // Backward compatibility: handle single new backup keys object
      const { portalAddress, newKeysVerified: newKeysVerifiedResult } =
        await verifyNewKeys(newBackupKeysArray)
      newKeysVerified = newKeysVerifiedResult

      if (!newKeysVerified) {
        setUploadState('incorrect')
        return
      }

      newPortalAddresses = [portalAddress]
    }

    return {
      legacyPortalAddress,
      legacyOwnerPrivateKey,
      newPortalAddresses,
      newKeysVerified,
    }
  }

  const verifyFileContentFromReader = (reader) => {
    reader.onload = async (e) => {
      try {
        let legacyFileCount = 0
        let newFileCount = 0
        const fileContent = JSON.parse(decodeURIComponent(e?.target?.result))

        // common function to split and format all the types of backup keys into old and new backup keys
        const { oldBackupKeys, newBackupKeys } = splitBackupKeys(fileContent)

        // make sure we have all the necessary keys in the backup file
        validateKey(oldBackupKeys, newBackupKeys)

        // Verify keys from the backup file using on-chain contract verification
        const {
          legacyPortalAddress,
          legacyOwnerPrivateKey,
          newPortalAddresses,
        } = await verifyKeys(oldBackupKeys, newBackupKeys)

        if (legacyPortalAddress) {
          legacyFileCount = await getLegacyPortalFileCount(legacyPortalAddress)
        }

        // Get file count for all new portal addresses
        if (newPortalAddresses && newPortalAddresses.length > 0) {
          const fileCounts = await Promise.all(
            newPortalAddresses.map((address) => getNewPortalFileCount(address))
          )
          newFileCount = fileCounts.reduce((sum, count) => sum + count, 0)
        }

        // Get the first new backup key's appDecryptionKey for backward compatibility
        const firstNewBackupKey =
          Array.isArray(newBackupKeys) && newBackupKeys.length > 0
            ? newBackupKeys[0]
            : newBackupKeys
        const source =
          oldBackupKeys.source ||
          (Array.isArray(newBackupKeys) && newBackupKeys.length > 0
            ? newBackupKeys[0].source
            : newBackupKeys?.source)

        // Per-portal key material for the retrieve pages. Upgraded and born
        // post-quantum portals carry their key ring (pqKeys); the flat
        // pqDecryptionKey of the very first PQ backup format is kept as a
        // fallback candidate (see utils/pq-lock.js). Nothing is derived.
        const newBackupKeysList = Array.isArray(newBackupKeys)
          ? newBackupKeys
          : newBackupKeys && Object.keys(newBackupKeys).length > 0
            ? [newBackupKeys]
            : []
        const newPortalKeys = {}
        for (const k of newBackupKeysList) {
          if (k?.portalAddress) {
            newPortalKeys[k.portalAddress.toLowerCase()] = {
              appDecryptionKey: k.appDecryptionKey || '',
              pqKeys: Array.isArray(k.pqKeys) ? k.pqKeys : [],
              pqDecryptionKey: k.pqDecryptionKey || '',
            }
          }
        }
        // A backup without post-quantum keys predates the PQ upgrade (or the
        // account itself). Documents published after the upgrade cannot be
        // opened with it; the upload screen says so.
        const prePqcBackup =
          newBackupKeysList.length > 0 &&
          newBackupKeysList.some(
            (k) => !(Array.isArray(k?.pqKeys) && k.pqKeys.length > 0) &&
              !k?.pqDecryptionKey
          )

        setPortalInformation({
          legacyFileCount,
          newFileCount,
          legacyPortalAddress: legacyPortalAddress,
          legacyOwnerPrivateKey: legacyOwnerPrivateKey,
          newPortalAddresses: newPortalAddresses || [],
          newOwnerPrivateKey: firstNewBackupKey?.appDecryptionKey || '',
          newPortalKeys,
          prePqcBackup,
          source: source || '',
        })
        setUploadState('uploaded')
      } catch (err) {
        if (err instanceof InvalidRecoveryJsonError) {
          setUploadState('incorrect')
        } else if (err instanceof InvalidSourceError) {
          setUploadState('invalid-source')
        }
      }
    }
  }

  const handleFile = (selectedFile) => {
    if (selectedFile.name.endsWith('.json')) {
      setUploadState('uploading')
      const reader = new FileReader()
      verifyFileContentFromReader(reader)
      reader.readAsText(selectedFile)
    } else {
      setUploadState('incorrect')
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      handleFile(droppedFile)
    }
  }, [])

  const handleChange = useCallback((e) => {
    e.preventDefault()
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      handleFile(selectedFile)
    }
  }, [])

  const onButtonClick = () => {
    inputRef.current.click()
  }

  const handleRetrieveClick = () => {
    if (file && uploadState === 'uploaded') {
      if (portalInformation.legacyPortalAddress) {
        navigate('/' + portalInformation.legacyPortalAddress + '/retrieve')
      } else if (
        portalInformation.newPortalAddresses &&
        portalInformation.newPortalAddresses.length > 0
      ) {
        // Navigate to the first new portal address
        navigate('/' + portalInformation.newPortalAddresses[0] + '/retrieve')
      }
    }
  }

  return {
    handleChange,
    handleDrag,
    handleDrop,
    onButtonClick,
    handleRetrieveClick,
    dragActive,
    uploadState,
    setUploadState,
    setFile,
    file,
    inputRef,
  }
}

export default useUpload
