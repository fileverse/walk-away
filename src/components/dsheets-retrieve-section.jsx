import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DsheetsIcon } from '../assets/icons'
import { usePortalProvider } from '../providers/portal-provider'
import {
  fetchNewFileResponse,
  decryptNewFile,
} from '../utils/new-file-decryption'
import { Skeleton } from './retrieve-section'
import { DSheetEditor } from '@fileverse-dev/dsheet'
import {
  getNewContractFile,
  getNewPortalFileCount,
} from '../utils/contract-functions'
import {
  reconstructGateMetadata,
  decryptTitleWithFileKey,
} from '../utils/new-portal-utils'
import { unwrapNewOwnerLockedFileKey } from '../utils/pq-lock'
import { fromUint8Array } from 'js-base64'

const DsheetsRetrieveSection = () => {
  const navigate = useNavigate()

  const { portalInformation } = usePortalProvider()
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState('')
  const [portalFileCounts, setPortalFileCounts] = useState([])

  const [content, setContent] = useState('')
  const [contentData, setContentData] = useState({
    contentHash: '',
    fileKey: {},
    archVersion: '',
    dsheetId: '',
  })
  const [newActiveFiles, setNewActiveFiles] = useState(new Set())

  const sheetEditorRef = useRef(null)
  const cssLinkRef = useRef(null)
  const getYdocRef = () => ({ current: window?.ydocRef })

  // Dynamically load dsheet styles only when component mounts
  useEffect(() => {
    const existingLink = document.getElementById('dsheet-styles')
    if (existingLink) {
      cssLinkRef.current = existingLink
      return
    }

    import('@fileverse-dev/dsheet/styles?url')
      .then((urlModule) => {
        const link = document.createElement('link')
        link.id = 'dsheet-styles'
        link.rel = 'stylesheet'
        link.type = 'text/css'
        link.href = urlModule.default
        link.setAttribute('data-dsheet-styles', 'true')

        document.head.appendChild(link)
        cssLinkRef.current = link
      })
      .catch((error) => {
        console.warn(
          'Failed to load dsheet styles with ?url suffix, using fallback:',
          error
        )
        import('@fileverse-dev/dsheet/styles').catch((err) => {
          console.error('Fallback dsheet styles import also failed:', err)
        })
      })

    return () => {
      if (cssLinkRef.current && cssLinkRef.current.parentNode) {
        cssLinkRef.current.parentNode.removeChild(cssLinkRef.current)
        cssLinkRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (
      !portalInformation.legacyOwnerPrivateKey &&
      !portalInformation.newOwnerPrivateKey
    ) {
      navigate('/')
    }
  }, [portalInformation])

  // Fetch file counts for all new portal addresses
  useEffect(() => {
    const fetchPortalFileCounts = async () => {
      if (
        portalInformation.newPortalAddresses &&
        portalInformation.newPortalAddresses.length > 0
      ) {
        const counts = await Promise.all(
          portalInformation.newPortalAddresses.map(async (address) => {
            const fileCount = await getNewPortalFileCount(address)
            return { address, fileCount }
          })
        )
        setPortalFileCounts(counts)
      }
    }

    fetchPortalFileCounts()
  }, [portalInformation.newPortalAddresses])

  const fetchContent = async (contentData) => {
    try {
      setIsError('')
      setIsLoading(true)
      const response = await fetchNewFileResponse(contentData.contentHash)
      const decryptedResult = await decryptNewFile(
        contentData.fileKey,
        response
      )
      setContent(decryptedResult.file)
      setIsLoading(false)
    } catch (error) {
      setIsError(error?.message || 'Failed to Fetch content')
    } finally {
      setIsLoading(false)
    }
    return
  }

  useEffect(() => {
    if (!contentData.contentHash) return
    fetchContent(contentData)
  }, [contentData.contentHash])

  const handleNewActiveFile = (fileId) => {
    setNewActiveFiles((prev) => {
      const newSet = new Set(prev)
      newSet.add(fileId)
      return newSet
    })
  }

  const handleExport = (type) => {
    const ydocRef = getYdocRef()
    import('@fileverse-dev/dsheet').then(
      ({ handleExportToXLSX, handleExportToCSV }) => {
        if (type === 'xlsx') {
          handleExportToXLSX(
            sheetEditorRef,
            ydocRef,
            contentData.dsheetId,
            () => contentData.title
          )
        } else {
          handleExportToCSV(sheetEditorRef, ydocRef)
        }
      }
    )
  }

  return (
    <div className="flex items-center justify-center p-4 bg-[#F8F9FA]">
      <div className="w-full max-w-[1312px] bg-white rounded-[12px]">
        <div className="flex">
          {/* Loaded state left sidebar */}
          <div className="flex flex-col items-start border-r border-gray-200 p-4 h-[calc(100vh-120px)] overflow-y-auto">
            <div className="w-[280px] flex flex-col gap-2 pt-2">
              {portalInformation.newFileCount > 0 &&
                portalFileCounts.length > 0 && (
                  <>
                    <p>dSheets</p>
                    <div className="text-[12px] leading-[16px] font-normal text-[#77818A]">
                      Documents: {newActiveFiles.size}
                    </div>
                    {portalFileCounts.map(({ address, fileCount }) =>
                      Array(fileCount)
                        .fill(0)
                        .map((_, index) => (
                          <DsheetFile
                            key={`${address}-${index}`}
                            fileId={index}
                            portalAddress={address}
                            contentData={contentData}
                            setContentData={setContentData}
                            onActiveFile={() =>
                              handleNewActiveFile(`${address}-${index}`)
                            }
                          />
                        ))
                    )}
                  </>
                )}
            </div>
          </div>

          {!content || isLoading ? (
            <div className="flex-1">
              <div className="flex justify-between items-center border-b border-[#E8EBEC] mb-4 p-[16px_24px_16px_16px] h-[60px]">
                <div>
                  <Skeleton className="h-5 w-[150px]" />
                </div>
                <div className="flex gap-2 p-2">
                  <div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
              <div className="pt-8 flex flex-col gap-1 items-center">
                <div className="space-y-1">
                  <Skeleton className="w-[480px] h-[40px]" />
                </div>
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="space-y-1">
                      <Skeleton className="w-[624px] h-[24px]" />
                      <Skeleton className="w-[624px] h-[24px]" />
                      <Skeleton className="w-[624px] h-[24px]" />
                      <Skeleton className="w-[540px] h-[24px]" />
                      <Skeleton className="w-[220px] h-[24px]" />
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex justify-between items-center py-3 px-3 border-b border-gray-200">
                <div className="font-medium text-[14px] leading-[20px] text-[#363B3F]">
                  IPFS hash: {contentData?.contentHash}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-[12px] text-[#6C757D]">
                    Download as:
                  </span>
                  <div
                    onClick={() => {
                      handleExport('csv')
                    }}
                    className="text-[12px] font-bold px-2 py-1 hover:bg-[#F8F9FA] rounded-[4px] border border-[#E8EBEC] cursor-pointer"
                  >
                    <span>.csv</span>
                  </div>
                  <div
                    onClick={() => {
                      handleExport('xlsx')
                    }}
                    className="text-[12px] font-bold px-2 py-1 hover:bg-[#F8F9FA] rounded-[4px] border border-[#E8EBEC] cursor-pointer"
                  >
                    <span>.xlsx</span>
                  </div>
                </div>
              </div>
              {isError ? (
                <div className="flex flex-col h-full w-full justify-center items-center">
                  <p>Error occurred</p>
                  <p>
                    {isError} Please{' '}
                    <span
                      className="hover:underline cursor-pointer text-blue-500 "
                      onClick={() => fetchContent(contentData)}
                    >
                      retry
                    </span>
                  </p>
                </div>
              ) : (
                <div className="p-6 overflow-y-auto h-[calc(100vh-180px)] scrollbar-hide">
                  <DSheetEditor
                    isReadOnly={true}
                    dsheetId={contentData.dsheetId}
                    sheetEditorRef={sheetEditorRef}
                    enableIndexeddbSync={true}
                    isAuthorized={false}
                    isNewSheet={false}
                    portalContent={content}
                    commentData={{}}
                    allowSheetDownload={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const DsheetFile = ({
  fileId,
  portalAddress: propPortalAddress,
  setContentData,
  contentData,
  onActiveFile,
}) => {
  const { portalInformation } = usePortalProvider()
  const { portalAddress: urlPortalAddress } = useParams()
  // Use prop portalAddress if provided, otherwise fall back to URL portalAddress
  const portalAddress = propPortalAddress || urlPortalAddress
  const [title, setDocTitle] = useState('')
  const [data, setData] = useState()
  const [hasCalledActiveFile, setHasCalledActiveFile] = useState(false)
  const [localData, setLocalData] = useState({
    fileKey: '',
    contentHash: '',
    archVersion: '',
  })

  const loadFileDetails = async () => {
    try {
      const details = await getNewContractFile(fileId, portalAddress)
      const metadataIPFSHash = details[2]
      const contentIPFSHash = details[3]
      const gateIPFSHash = details[4] || ''

      if (!contentIPFSHash || !metadataIPFSHash)
        throw new Error('metadata or content is empty')
      const metadata = await reconstructGateMetadata(
        metadataIPFSHash,
        gateIPFSHash
      )
      if (metadata?.isDeleted) {
        return null // Skip rendering if file is deleted
      }
      const dsheetId = metadata.dsheetId

      const ownerLockedFileKey = metadata.appLock.lockedFileKey

      // FVPQ1-prefixed locks (sheets published after the post-quantum
      // upgrade) route to the portal's PQ key; everything else stays ECIES.
      const portalKeys =
        portalInformation.newPortalKeys?.[portalAddress?.toLowerCase()] || {}
      const fileKeyArray = await unwrapNewOwnerLockedFileKey({
        lockedFileKey: ownerLockedFileKey,
        appDecryptionKey:
          portalKeys.appDecryptionKey || portalInformation.newOwnerPrivateKey,
        pqDecryptionKey: portalKeys.pqDecryptionKey,
        ownerSecret: portalKeys.ownerSecret,
        portalAddress,
      })

      const fileKey = fromUint8Array(fileKeyArray)

      const title = await decryptTitleWithFileKey(metadata.title, fileKey)

      setDocTitle(title)

      setLocalData({
        fileKey,
        contentHash: contentIPFSHash,
        archVersion: metadata.version,
        dsheetId,
      })

      if (fileId === 0) {
        setContentData({
          fileKey,
          contentHash: contentIPFSHash,
          archVersion: metadata.version,
        })
      }

      setData({ fileKey, contentHash: contentIPFSHash })

      if (!hasCalledActiveFile) {
        onActiveFile()
        setHasCalledActiveFile(true)
      }
    } catch (error) {
      console.error('Error loading file details:', error)
    }
  }

  useEffect(() => {
    loadFileDetails()
  }, [])

  return data ? ( // Only render if data exists (file is not deleted)
    <div
      onClick={() => {
        if (!data) return
        setContentData({
          fileKey: localData.fileKey,
          contentHash: localData.contentHash,
          archVersion: localData.archVersion,
          dsheetId: localData.dsheetId,
        })
      }}
      className={`flex items-center gap-3 p-2 hover:bg-[#F8F9FA] ${contentData.contentHash === data?.contentHash && 'bg-[#F8F9FA]'} rounded-[4px] cursor-pointer`}
    >
      <div className="w-5 h-5 bg-[#FFE5B3] rounded-[4px] flex items-center justify-center">
        <DsheetsIcon />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[14px] leading-[20px] text-[#363B3F] truncate">
          {title}
        </div>
      </div>
    </div>
  ) : null
}

export { DsheetsRetrieveSection }
