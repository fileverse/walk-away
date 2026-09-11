import { pqDecrypt, VERSION as PQ_VERSION } from '@fileverse/crypto/pq'
import { eciesDecrypt } from '@fileverse/crypto/ecies'
import { toBytes } from '@fileverse/crypto/utils'

// Mirror of the dDocs app's doc-lock read router (keystore/new-crypto.ts):
// a lock wrapped with the portal's post-quantum pair announces itself with
// the FVPQ1 prefix; legacy ECIES strings are 4 __n__-joined base64 parts
// and can never start with it.
export const isPqLock = (encrypted) =>
  typeof encrypted === 'string' && encrypted.startsWith(PQ_VERSION)

export const MISSING_PQ_KEYS_MESSAGE =
  'This document is protected with post-quantum keys that are not in this backup file. Download a fresh backup from dDocs Settings and try again.'

/**
 * Candidate post-quantum private keys for a portal, most likely first.
 *
 * A backup file carries the portal's key ring as `pqKeys`: one entry per
 * version, each with the 32-byte private key. Writes stamp the version of
 * the entry that sealed them (metadata.workspaceKeyVersion), so that entry
 * is tried first, then the rest newest-first. The flat `pqDecryptionKey`
 * of the very first backup format is kept as a last candidate.
 *
 * The pair is random and stored, never derived: a backup without it cannot
 * open post-quantum locks, full stop.
 */
const pqKeyCandidates = ({ pqKeys, pqDecryptionKey, keyVersion }) => {
  const ring = Array.isArray(pqKeys)
    ? pqKeys.filter((k) => k && typeof k.privateKey === 'string')
    : []
  const byVersion = [...ring].sort((a, b) => b.version - a.version)
  const preferred =
    keyVersion !== undefined && keyVersion !== null
      ? byVersion.filter((k) => k.version === keyVersion)
      : []
  const rest = byVersion.filter((k) => !preferred.includes(k))
  const candidates = [...preferred, ...rest].map((k) => k.privateKey)
  if (pqDecryptionKey) candidates.push(pqDecryptionKey)
  return candidates
}

/**
 * Unwrap a new-portal ownerLock/appLock fileKey with whichever key
 * generation the lock was written for. Returns the raw fileKey bytes.
 */
export const unwrapNewOwnerLockedFileKey = async ({
  lockedFileKey,
  appDecryptionKey,
  pqKeys,
  pqDecryptionKey,
  keyVersion,
}) => {
  if (isPqLock(lockedFileKey)) {
    const candidates = pqKeyCandidates({ pqKeys, pqDecryptionKey, keyVersion })
    if (candidates.length === 0) throw new Error(MISSING_PQ_KEYS_MESSAGE)
    let lastError
    for (const candidate of candidates) {
      try {
        return await pqDecrypt(toBytes(candidate), lockedFileKey)
      } catch (err) {
        lastError = err
      }
    }
    throw lastError || new Error(MISSING_PQ_KEYS_MESSAGE)
  }
  if (!appDecryptionKey) {
    throw new Error(
      'This document uses the portal EC key, which is not in this backup file.'
    )
  }
  return eciesDecrypt(toBytes(appDecryptionKey), lockedFileKey)
}
