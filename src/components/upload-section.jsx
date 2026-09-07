import {
  FileIcon,
  CloseIcon,
  ChevronGreyIcon,
  RetryIcon,
} from '../assets/icons'
import { useState } from 'react'
import useUpload from '../hooks/use-upload'
import { usePortalProvider } from '../providers/portal-provider'
import { Modal } from './modal'
import { SettingsModalContent } from './settings-modal-content'
import { SettingsIcon } from '../assets/icons'

const UploadSection = () => {
  const [showKeyHelp, setShowKeyHelp] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { portalInformation } = usePortalProvider()

  const {
    uploadState,
    setUploadState,
    setFile,
    dragActive,
    handleChange,
    handleDrag,
    handleDrop,
    handleRetrieveClick,
    onButtonClick,
    inputRef,
    file,
  } = useUpload()

  const getStatusDisplay = () => {
    switch (uploadState) {
      case 'uploading':
        return (
          <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-black animate-progress"></div>
          </div>
        )
      case 'uploaded':
        return (
          <div className="bg-[#DDFBDF] rounded-[4px]  text-[12px] leading-[16px] font-normal text-[#177E23] p-1">
            Uploaded
          </div>
        )
      case 'failed':
        return (
          <div className="bg-[#FFE5E5] rounded-[4px]  text-[12px] leading-[16px] font-normal text-[#D92D20] p-1">
            Failed to upload
          </div>
        )
      case 'incorrect':
        return (
          <div className="bg-[#FFE5E5] rounded-[4px]  text-[12px] leading-[16px] font-normal text-[#D92D20] p-1">
            Incorrect file format
          </div>
        )
      case 'invalid-source':
        return (
          <div className="bg-[#FFE5E5] rounded-[4px]  text-[12px] leading-[16px] font-normal text-[#D92D20] p-1">
            Wrong file source
          </div>
        )
      default:
        return null
    }
  }

  const getActionIcon = () => {
    if (uploadState === 'failed') {
      return (
        <button
          onClick={() => {
            setUploadState('uploading')
            // Retry upload logic here
            setTimeout(() => {
              setUploadState('uploaded')
            }, 2000)
          }}
          className="p-1 text-gray-400 hover:bg-[#F2F4F5] hover:text-gray-600 cursor-pointer rounded-[4px]"
        >
          <RetryIcon />
        </button>
      )
    }

    return (
      <button
        onClick={() => {
          setFile(null)
          setUploadState(null)
        }}
        className="p-1 text-gray-400 hover:bg-[#F2F4F5] hover:text-gray-600 cursor-pointer rounded-[4px]"
      >
        <CloseIcon />
      </button>
    )
  }

  return (
    <div className="mb-[40px]">
      <div className="px-0 py-10 max-w-[960px] bg-white rounded-xl">
        <div className="py-0 px-6">
          <div className="w-full flex items-center justify-between">
            <h2 className="font-medium text-sm leading-5 text-[#363B3F] mb-3">
              Upload your Backup Keys
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="font-medium text-sm leading-5 cursor-pointer flex items-center gap-2"
            >
              <SettingsIcon />
              <span className="text-sm leading-5 text-[#363B3F]">Settings</span>
            </button>
          </div>
          <div
            className={`border-[1px] border-dashed ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-[#E8EBEC]'
            } 
                  rounded font-normal text-sm leading-5 text-[#A1AAB1] p-8 text-center mb-4`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".json"
              onChange={handleChange}
              className="hidden"
            />
            <p className="text-gray-500">
              Drag & Drop your dDocs JSON file in this area or
              <br />
              <button
                onClick={onButtonClick}
                className="text-[#5C0AFF] hover:underline cursor-pointer"
              >
                Browse
              </button>
            </p>
          </div>

          {file &&
            uploadState === 'uploaded' &&
            portalInformation.prePqcBackup && (
              <div className="mb-3 rounded-[4px] border border-[#F16227] bg-[#FEF5E6] p-3 text-[12px] leading-[16px] font-normal text-[#363B3F]">
                This backup file is from before the post-quantum upgrade.
                Documents saved after the upgrade will not open with it.
                Download a fresh backup from your dDocs or dSheets Settings.
              </div>
            )}

          {file && (
            <div className="p-1 mb-4 hover:bg-[#F2F4F5] transition-colors duration-200 rounded-[4px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-gray-600">
                    <FileIcon />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusDisplay()}
                  {getActionIcon()}
                </div>
              </div>
            </div>
          )}

          <div className="mt-2 mb-2">
            <button
              onClick={() => setShowKeyHelp(!showKeyHelp)}
              className="font-normal text-[14px] leading-5 text-[#77818A] hover:text-gray-600 underline decoration-dashed cursor-pointer flex items-center gap-1"
            >
              Where can I find my backup key?
              <ChevronGreyIcon />
            </button>

            {showKeyHelp && (
              <div className="mt-2 text-[14px] leading-[20px] text-[#77818A] font-normal">
                Sign in to your{' '}
                <a
                  href="https://ddocs.new"
                  target="_blank"
                  className="text-[#5C0AFF] hover:underline"
                >
                  ddocs.new
                </a>{' '}
                or{' '}
                <a
                  href="https://dsheets.new"
                  target="_blank"
                  className="text-[#5C0AFF] hover:underline"
                >
                  dsheets.new
                </a>{' '}
                account, go on Settings and click &quot;download&quot; to save
                your Backup Keys.
              </div>
            )}
          </div>
          <button
            className={`p-4 mt-4 w-full rounded font-medium text-[14px] leading-[20px] cursor-pointer
                  ${
                    file && uploadState === 'uploaded'
                      ? 'bg-[#FFDF0A] text-black hover:bg-[#EFC703]'
                      : 'bg-[#E8EBEC] text-[#A1AAB1]'
                  }`}
            disabled={!file || uploadState !== 'uploaded'}
            onClick={handleRetrieveClick}
          >
            Retrieve documents
          </button>
          <Modal
            open={showModal}
            onClose={() => setShowModal(false)}
            title="Settings"
          >
            <SettingsModalContent setShowModal={setShowModal} />
          </Modal>
        </div>
      </div>
    </div>
  )
}

export { UploadSection }
