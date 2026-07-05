export interface StoreInfo {
  id: string;
  store: "chrome" | "edge";
}

const CHROME_URL_RE =
  /chromewebstore\.google\.com\/(?:webstore\/)?detail\/[^/]+\/([a-z0-9]+)/i;
const EDGE_URL_RE =
  /microsoftedge\.microsoft\.com\/addons\/detail\/[^/]+\/([a-z0-9]+)/i;
const BARE_ID_RE = /^[a-z0-9]+$/i;

export function parseStoreUrl(input: string): StoreInfo {
  const trimmed = input.trim();

  // Try Chrome Web Store URL
  const chromeMatch = trimmed.match(CHROME_URL_RE);
  if (chromeMatch) {
    return { id: chromeMatch[1].toLowerCase(), store: "chrome" };
  }

  // Try Edge Add-ons URL
  const edgeMatch = trimmed.match(EDGE_URL_RE);
  if (edgeMatch) {
    return { id: edgeMatch[1].toLowerCase(), store: "edge" };
  }

  // Try bare extension ID (32 lowercase letters)
  if (BARE_ID_RE.test(trimmed)) {
    return { id: trimmed.toLowerCase(), store: "chrome" };
  }

  throw new Error(
    `Invalid extension URL or ID: "${input}". Expected a Chrome Web Store URL, Edge Add-ons URL, or a 32-character extension ID.`,
  );
}
