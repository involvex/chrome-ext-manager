// src/search.ts

export interface SearchResult {
  name: string;
  id: string;
  store: "chrome" | "edge";
}

/**
 * Search the Chrome Web Store for extensions matching a query.
 */
export async function searchChromeWebStore(query: string): Promise<SearchResult[]> {
  const url = `https://chromewebstore.google.com/search/${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Chrome Web Store search failed: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const html = await response.text();

  // Extract extension IDs and names from the search results
  const regex = /detail\/([^/"']+)\/([a-z]{32})/g;
  const results: SearchResult[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const match = regex.exec(html);
    if (!match) break;
    const slug = match[1];
    const id = match[2];

    // Try to find a better name near this match
    const start = Math.max(0, match.index - 500);
    const end = Math.min(html.length, match.index + 500);
    const snippet = html.substring(start, end);

    // Look for aria-label or title with the name
    const nameMatch = snippet.match(/aria-label="([^"]+)"/);
    const name = nameMatch ? nameMatch[1] : slug;

    // Avoid duplicates
    if (!results.find((r) => r.id === id)) {
      results.push({ name, id, store: "chrome" });
    }
  }

  return results;
}

/**
 * Search the Edge Add-ons store for extensions matching a query.
 */
export async function searchEdgeAddons(query: string): Promise<SearchResult[]> {
  const url = `https://microsoftedge.microsoft.com/addons/search/${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Edge Add-ons search failed: HTTP ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // Extract extension IDs and names from the search results
  const regex = /addons\/detail\/([^/"']+)\/([a-z0-9]+)/g;
  const results: SearchResult[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const match = regex.exec(html);
    if (!match) break;
    const slug = match[1];
    const id = match[2];

    // Try to find a better name near this match
    const start = Math.max(0, match.index - 500);
    const end = Math.min(html.length, match.index + 500);
    const snippet = html.substring(start, end);

    // Look for aria-label or title with the name
    const nameMatch = snippet.match(/aria-label="([^"]+)"/);
    const name = nameMatch ? nameMatch[1] : slug;

    // Avoid duplicates
    if (!results.find((r) => r.id === id)) {
      results.push({ name, id, store: "edge" });
    }
  }

  return results;
}

/**
 * Search both Chrome Web Store and Edge Add-ons for extensions matching a query.
 */
export async function searchExtensions(query: string): Promise<SearchResult[]> {
  const [chromeResults, edgeResults] = await Promise.all([
    searchChromeWebStore(query).catch(() => []),
    searchEdgeAddons(query).catch(() => []),
  ]);

  return [...chromeResults, ...edgeResults];
}
