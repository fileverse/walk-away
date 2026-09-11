import { createContext, useContext, useState } from 'react'

const PortalProviderContext = createContext({
  setPortalInformation: (data) => data,
  portalInformation: {
    legacyFileCount: 0,
    newFileCount: 0,
    legacyPortalAddress: '',
    legacyOwnerPrivateKey: '',
    newPortalAddresses: [],
    newOwnerPrivateKey: '',
    newPortalKeys: {},
    source: '',
  },
})

export const usePortalProvider = () => useContext(PortalProviderContext)

const PortalProvider = ({ children }) => {
  const [portalInformation, setPortalInformation] = useState({
    legacyFileCount: 0,
    newFileCount: 0,
    legacyPortalAddress: '',
    legacyOwnerPrivateKey: '',
    newPortalAddresses: [],
    newOwnerPrivateKey: '',
    newPortalKeys: {},
    source: '',
  })
  return (
    <PortalProviderContext.Provider
      value={{
        setPortalInformation,
        portalInformation,
      }}
    >
      {children}
    </PortalProviderContext.Provider>
  )
}

export default PortalProvider
