import { isKeysVerified, isNewKeysVerified } from './is-keys-verified'
import {
  getPortalKeysVerifiers,
  getNewPortalKeysVerifiers,
  getNewPortalKeysVerifiersAt,
} from './contract-functions'

export const EMPTY_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

export const verifyPortalKeysFromContract = async ({
  keys,
  contractAddress,
}) => {
  const keyVerifiers = await getPortalKeysVerifiers(contractAddress)

  if (keyVerifiers.some((verifier) => verifier === EMPTY_HASH)) {
    return null
  }
  return isKeysVerified(keyVerifiers, keys)
}

export const verifyNewPortalKeysFromContract = async ({
  appEncryptionKey,
  appDecryptionKey,
  contractAddress,
}) => {
  const keyVerifiers = await getNewPortalKeysVerifiers(contractAddress)
  return isNewKeysVerified(appEncryptionKey, appDecryptionKey, keyVerifiers)
}

// Every ring entry must be registered on the portal at its own version:
// sha256(publicKey) / sha256(privateKey), same as the EC pair at 0.
export const verifyPqRingFromContract = async ({ pqKeys, contractAddress }) => {
  for (const entry of pqKeys) {
    const keyVerifiers = await getNewPortalKeysVerifiersAt(
      contractAddress,
      entry.version
    )
    const ok = await isNewKeysVerified(
      entry.publicKey,
      entry.privateKey,
      keyVerifiers
    )
    if (!ok) return false
  }
  return true
}
