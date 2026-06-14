import ChevronIcon from '../assets/chevron-icon'
import { useState } from 'react'

export const SettingsModalContent = ({ setShowModal }) => {
  const [settings, setSettings] = useState(
    JSON.parse(localStorage.getItem('fileverse-walkaway-settings')) || {
      rpcEndpoint: '',
      pinataGateway: '',
    }
  )
  const [error, setError] = useState(null)
  const [showHowToConfigure, setShowHowToConfigure] = useState(false)

  const handleSettingsChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value.trim() })
  }

  const handleResetToDefault = () => {
    setSettings({ rpcEndpoint: '', pinataGateway: '' })
    localStorage.removeItem('fileverse-walkaway-settings')
    setError(null)
  }

  const handleCancel = () => {
    setShowModal(false)
    setError(null)
  }

  const handleApply = () => {
    if (!validateUrls(settings.rpcEndpoint, { allowMultiple: true })) {
      setError('Invalid RPC endpoint URL(s)')
      return
    }

    if (!validateUrls(settings.pinataGateway, { allowMultiple: true })) {
      setError('Invalid Pinata gateway URL(s)')
      return
    }

    localStorage.setItem(
      'fileverse-walkaway-settings',
      JSON.stringify(settings)
    )

    setShowModal(false)
    setError(null)
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <p className="text-[14px]">
        You can set your own RPC endpoint and Pinata gateway to rely only on
        your own infrastructure.
      </p>
      <div className="w-full flex flex-col gap-2">
        <p className="text-[14px] font-medium">RPC endpoint</p>
        <input
          type="text"
          className="text-[14px] w-full py-2 px-3 border border-[#E8EBEC] rounded-[4px] placeholder:text-[#77818A]"
          placeholder="https://rpc.gnosischain.com"
          value={settings.rpcEndpoint}
          name="rpcEndpoint"
          onChange={handleSettingsChange}
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <p className="text-[14px] font-medium">Pinata gateway</p>
        <input
          type="text"
          className="text-[14px] w-full py-2 px-3 border border-[#E8EBEC] rounded-[4px] placeholder:text-[#77818A]"
          placeholder="https://your-custom-gateway.mypinata.cloud, https://your-custom-gateway.mypinata.cloud"
          value={settings.pinataGateway}
          name="pinataGateway"
          onChange={handleSettingsChange}
        />
      </div>
      <div className="w-full flex flex-col gap-3 bg-[#F8F9FA] rounded-[4px] py-2 px-3">
        <div
          className="flex items-center justify-between cursor-pointer py-2"
          onClick={() => setShowHowToConfigure(!showHowToConfigure)}
        >
          <p className="text-[14px] font-medium">
            How configure your own walkaway page?
          </p>
          <span
            className={`transition-transform duration-300 ${showHowToConfigure ? 'rotate-180' : ''}`}
          >
            <ChevronIcon />
          </span>
        </div>
        {showHowToConfigure && (
          <div className="flex flex-col gap-2 text-[14px] px-2">
            <p>
              1. Put an PRC endopint url. How to get see{' '}
              <a
                href="https://www.alchemy.com/rpc/gnosis"
                target="_blank"
                className="text-[#5C0AFF] cursor-pointer hover:underline"
              >
                here
              </a>
            </p>
            <p>
              2. Put a Pinata gateway url. You can add a multiple urls comma
              separated.
            </p>
            <p>3. Apply settings</p>
            <p>4. Upload a JSON key and follow a regular flow</p>
          </div>
        )}
      </div>
      {error && <p className="text-[14px] text-red-500">{error}</p>}
      <div className="w-full flex justify-between items-center">
        <button
          className="text-[14px] font-medium w-[135px] h-[36px] flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleResetToDefault}
          disabled={
            settings.rpcEndpoint === '' && settings.pinataGateway === ''
          }
        >
          {' '}
          Reset to default
        </button>
        <div className="flex items-center gap-4">
          <button
            className="text-[14px] font-medium w-[80px] h-[36px] flex items-center justify-center cursor-pointer"
            onClick={handleCancel}
          >
            {' '}
            Cancel
          </button>
          <button
            className="text-[14px] font-medium w-[80px] h-[36px] flex items-center justify-center cursor-pointer rounded bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleApply}
            disabled={
              settings.rpcEndpoint === '' && settings.pinataGateway === ''
            }
          >
            {' '}
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

const isValidUrl = (url) => {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

const validateUrls = (value, { allowMultiple = false } = {}) => {
  if (!value) return true

  const urls = (allowMultiple ? value.split(',') : [value])
    .map((u) => u.trim())
    .filter(Boolean) // <-- handles "a.com, " or extra commas

  return urls.every(isValidUrl)
}
