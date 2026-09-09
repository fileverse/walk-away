import { gunzipSync } from 'fflate'
import { fromUint8Array, toUint8Array } from 'js-base64'

/**
 * dSheet publish compression (read side). Published dSheet envelopes store
 * `gz1:` + base64(gzip(yjsUpdate)) because the Yjs state gzips ~10x. Readers
 * must inflate before handing the base64 Yjs to the editor. The marker keeps
 * old (plain base64) and new (compressed) files unambiguous.
 */
export const DSHEET_COMPRESSED_CONTENT_PREFIX = 'gz1:'

export const isCompressedDsheetContent = (value) =>
  typeof value === 'string' &&
  value.startsWith(DSHEET_COMPRESSED_CONTENT_PREFIX)

/**
 * Inflate a `gz1:`-marked string back to the base64 Yjs state.
 * Unmarked values (plain ddoc/dsheet content) pass through unchanged;
 * a corrupt compressed value yields undefined.
 */
export const decompressDsheetContentIfNeeded = (value) => {
  if (value == null || !isCompressedDsheetContent(value)) return value
  try {
    const zipped = toUint8Array(
      value.slice(DSHEET_COMPRESSED_CONTENT_PREFIX.length)
    )
    return fromUint8Array(gunzipSync(zipped))
  } catch {
    return undefined
  }
}
