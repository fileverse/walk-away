function isOldBackupKeys(value) {
  return (
    typeof value === 'object' &&
    'portalAddress' in value &&
    'ownerPublicKey' in value &&
    'ownerPrivateKey' in value &&
    'portalPrivateKey' in value &&
    'portalPublicKey' in value &&
    'memberPrivateKey' in value &&
    'memberPublicKey' in value &&
    'source' in value
  )
}

function isNewBackupKeysFormat(value) {
  return (
    typeof value === 'object' &&
    'portalAddress' in value &&
    'ownerPublicKey' in value &&
    'ownerPrivateKey' in value &&
    'portalPublicKey' in value &&
    'source' in value
  )
}

// A post-quantum ring: one entry per portal key version, private key inside.
export function hasPqRing(value) {
  return (
    Array.isArray(value?.pqKeys) &&
    value.pqKeys.length > 0 &&
    value.pqKeys.every(
      (k) =>
        k &&
        typeof k.publicKey === 'string' &&
        typeof k.privateKey === 'string' &&
        Number.isInteger(k.version)
    )
  )
}

export function hasEcPair(value) {
  return Boolean(value?.appEncryptionKey && value?.appDecryptionKey)
}

function isNewBackupKeys(value) {
  return (
    typeof value === 'object' &&
    'portalAddress' in value &&
    'ownerDid' in value &&
    'ownerSecret' in value &&
    // permissionAddress is optional: ddocs only writes it when the portal has
    // a permission contract, and portals created after the semaphore cleanup
    // (ddocs #1100) never deploy one. validateNewKey does not require it.
    'source' in value &&
    // Upgraded portals carry both; born post-quantum portals carry only the
    // ring; classic portals only the EC pair.
    (hasEcPair(value) || hasPqRing(value))
  )
}

export function splitBackupKeys(data) {
  let oldBackupKeys = {}
  let newBackupKeys = []

  //Just old backup keys (before Privacy Upgrade)
  if (
    isOldBackupKeys(data) &&
    data.memberPublicKey !== '' &&
    data.memberPrivateKey !== ''
  ) {
    oldBackupKeys = data
    return { oldBackupKeys, newBackupKeys }
  }

  //Just new backup keys (after Privacy Upgrade and before Walk Away page v2)
  if (
    isNewBackupKeysFormat(data) &&
    data.memberPublicKey === '' &&
    data.memberPrivateKey === ''
  ) {
    newBackupKeys = [
      {
        portalAddress: data.portalAddress,
        appEncryptionKey: data.ownerPublicKey,
        appDecryptionKey: data.ownerPrivateKey,
        source: data.source,
      },
    ]
    return { oldBackupKeys, newBackupKeys }
  }

  //Just new backup keys (after Walk Away page v2 and after Privacy Upgrade)
  if (isNewBackupKeys(data)) {
    newBackupKeys = [data]
    return { oldBackupKeys, newBackupKeys }
  }

  // Mixed backup keys (after Walk Away page v2 and after Privacy Upgrade and has both old and new backup keys)
  // Also handles multiple new backup keys
  if (data && typeof data === 'object') {
    for (const value of Object.values(data)) {
      if (isOldBackupKeys(value)) {
        oldBackupKeys = value
      } else if (isNewBackupKeys(value)) {
        newBackupKeys.push(value)
      } else if (
        isNewBackupKeysFormat(value) &&
        value.memberPublicKey === '' &&
        value.memberPrivateKey === ''
      ) {
        newBackupKeys.push({
          portalAddress: value.portalAddress,
          appEncryptionKey: value.ownerPublicKey,
          appDecryptionKey: value.ownerPrivateKey,
          source: value.source,
        })
      }
    }
  }

  return { oldBackupKeys, newBackupKeys }
}
