export class IngestionFetchError extends Error {}

/**
 * Fetches a URL and fails fast if the HTTP status or Content-Type isn't one
 * of the expected values — never hands an HTML error/login page downstream
 * to be misparsed as JSON/CSV/XLSX.
 */
export async function fetchValidated(
  url: string,
  expectedContentTypes: readonly string[],
  init?: RequestInit,
): Promise<{ contentType: string; body: ArrayBuffer }> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    throw new IngestionFetchError(
      `Network error fetching ${url}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!res.ok) {
    throw new IngestionFetchError(`HTTP ${res.status} ${res.statusText} from ${url}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const matches = expectedContentTypes.some((expected) => contentType.includes(expected));
  if (!matches) {
    throw new IngestionFetchError(
      `Unexpected Content-Type "${contentType}" from ${url} (expected one of: ${expectedContentTypes.join(", ")})`,
    );
  }

  return { contentType, body: await res.arrayBuffer() };
}
