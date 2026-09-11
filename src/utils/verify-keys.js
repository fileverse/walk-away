import {
  verifyPortalKeysFromContract,
  verifyNewPortalKeysFromContract,
  verifyPqRingFromContract,
} from './verify-portal-keys-from-contract'
import { hasEcPair, hasPqRing } from './get-portal-keys'

export const verifyLegacyKeys = async (oldBackupKeys) => {
  const {
    portalPublicKey,
    portalPrivateKey,
    memberPublicKey,
    memberPrivateKey,
    portalAddress,
    ownerPrivateKey,
  } = oldBackupKeys
  const keys = {
    portalPublicKey,
    portalPrivateKey,
    memberPublicKey,
    memberPrivateKey,
  }
  const isVerified = await verifyPortalKeysFromContract({
    keys,
    contractAddress: portalAddress,
  })

  return {
    portalAddress,
    ownerPrivateKey,
    legacyKeysVerified: isVerified,
  }
}

export const verifyNewKeys = async (newBackupKeys) => {
  const { portalAddress, appEncryptionKey, appDecryptionKey, pqKeys } =
    newBackupKeys

  // Whatever the file carries has to match the portal: the EC pair at
  // verifier 0, each post-quantum ring entry at its version.
  let isVerified = true
  if (hasEcPair(newBackupKeys)) {
    isVerified = await verifyNewPortalKeysFromContract({
      appEncryptionKey,
      appDecryptionKey,
      contractAddress: portalAddress,
    })
  }
  if (isVerified && hasPqRing(newBackupKeys)) {
    isVerified = await verifyPqRingFromContract({
      pqKeys,
      contractAddress: portalAddress,
    })
  }
  return {
    portalAddress,
    newKeysVerified: isVerified,
  }
}
