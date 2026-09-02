import {
  pqDecrypt,
  generatePqKeyPair,
  VERSION as PQ_VERSION,
} from '@fileverse/crypto/pq'
import { derivePortalPqSeed } from '@fileverse/crypto/identity'
import { eciesDecrypt } from '@fileverse/crypto/ecies'
import { toBytes } from '@fileverse/crypto/utils'

// Mirror of the dDocs app's doc-lock read router (keystore/new-crypto.ts):
// a lock wrapped with the portal's post-quantum pair announces itself with
// the FVPQ1 prefix; legacy ECIES strings are 4 __n__-joined base64 parts
// and can never start with it.
export const isPqLock = (encrypted) =>
  typeof encrypted === 'string' && encrypted.startsWith(PQ_VERSION)

/**
 * Resolve the portal's post-quantum decryption key.
 *
 * Fresh backup files (downloaded after the post-quantum upgrade shipped)
 * carry pqDecryptionKey directly. Older files still work: the portal PQ
 * pair is DERIVED in the dDocs app — seed = HKDF(ownerSecret, portal
 * address) — and ownerSecret has always been in the backup file, so we
 * re-derive the identical pair here.
 */
const resolvePqDecryptionKey = async ({
  pqDecryptionKey,
  ownerSecret,
  portalAddress,
}) => {
  if (pqDecryptionKey) return toBytes(pqDecryptionKey)
  if (ownerSecret) {
    const seed = derivePortalPqSeed(ownerSecret, portalAddress)
    const pair = await generatePqKeyPair(seed)
    return pair.privateKey
  }
  throw new Error(
    'This document is protected with post-quantum keys that are not in this backup file. Download a fresh backup from dDocs Settings and try again.'
  )
}

/**
 * Unwrap a new-portal ownerLock fileKey with whichever key generation the
 * lock was written for. Returns the raw fileKey bytes.
 */
export const unwrapNewOwnerLockedFileKey = async ({
  lockedFileKey,
  appDecryptionKey,
  pqDecryptionKey,
  ownerSecret,
  portalAddress,
}) => {
  if (isPqLock(lockedFileKey)) {
    const pqKey = await resolvePqDecryptionKey({
      pqDecryptionKey,
      ownerSecret,
      portalAddress,
    })
    return pqDecrypt(pqKey, lockedFileKey)
  }
  return eciesDecrypt(toBytes(appDecryptionKey), lockedFileKey)
}
