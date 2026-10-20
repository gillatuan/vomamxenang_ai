/**
 * Temporary backwards-compatible storage for a Google Maps link while the
 * StoreInfo.googleMapsUrl migration is pending on production.
 * The data lives in existing StoreInfo.notes and is hidden from public notes.
 */
export const MAPS_MARKER = '\n[STORE_INFO_GOOGLE_MAPS_V1]';
export function splitStoreNotes(input: string | null | undefined): { notes: string | null; googleMapsUrl: string | null } {
  const text = input ?? '';
  const i = text.lastIndexOf(MAPS_MARKER);
  if (i < 0) return { notes: input ?? null, googleMapsUrl: null };
  const encoded = text.slice(i + MAPS_MARKER.length);
  try {
    const url = decodeURIComponent(encoded);
    if (!/^https:\/\//i.test(url) || !url.toLowerCase().includes('google')) throw Error('Invalid URL');
    return { notes: text.slice(0, i) || null, googleMapsUrl: url };
  } catch {
    // Malformed metadata must not accidentally destroy the user's actual notes.
    return { notes: input ?? null, googleMapsUrl: null };
  }
}
export function joinStoreNotes(notes: string | null | undefined, googleMapsUrl: string | null | undefined): string | null {
  const clean = splitStoreNotes(notes).notes ?? '';
  return googleMapsUrl
    ? clean + MAPS_MARKER + encodeURIComponent(googleMapsUrl)
    : clean || null;
}
