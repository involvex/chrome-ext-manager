# Task 2: URL Parser Module

**Files:**
- Create: `src/url-parser.ts`
- Create: `test/url-parser.test.ts`

**Interfaces:**
- Consumes: none
- Produces: `parseStoreUrl(url: string): StoreInfo` where `StoreInfo = { id: string; store: 'chrome' | 'edge' }`

- [ ] **Step 1: Write failing tests**

```typescript
// test/url-parser.test.ts
import { describe, test, expect } from "bun:test";
import { parseStoreUrl } from "../src/url-parser";

describe("parseStoreUrl", () => {
  test("parses Chrome Web Store URL", () => {
    const result = parseStoreUrl(
      "https://chromewebstore.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm"
    );
    expect(result).toEqual({ id: "cjpalhdlnbpafiamejdnhcphjbkeiagm", store: "chrome" });
  });

  test("parses Chrome URL with query params", () => {
    const result = parseStoreUrl(
      "https://chromewebstore.google.com/detail/ext-name/abcdef1234567890abcdef12?hl=en"
    );
    expect(result).toEqual({ id: "abcdef1234567890abcdef12", store: "chrome" });
  });

  test("parses Edge Add-ons URL", () => {
    const result = parseStoreUrl(
      "https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak"
    );
    expect(result).toEqual({ id: "odfafepnkmbhccpbejgmiehpchacaeak", store: "edge" });
  });

  test("parses bare 32-char extension ID as chrome", () => {
    const result = parseStoreUrl("cjpalhdlnbpafiamejdnhcphjbkeiagm");
    expect(result).toEqual({ id: "cjpalhdlnbpafiamejdnhcphjbkeiagm", store: "chrome" });
  });

  test("throws on invalid input", () => {
    expect(() => parseStoreUrl("")).toThrow();
    expect(() => parseStoreUrl("not-a-valid-id!")).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test test/url-parser.test.ts
```
Expected: FAIL — `parseStoreUrl` not found

- [ ] **Step 3: Implement url-parser.ts**

```typescript
// src/url-parser.ts

export interface StoreInfo {
  id: string;
  store: "chrome" | "edge";
}

const CHROME_URL_RE =
  /chromewebstore\.google\.com\/webstore\/detail\/[^/]+\/([a-z]{32})/i;
const EDGE_URL_RE =
  /microsoftedge\.microsoft\.com\/addons\/detail\/([a-z]{32})/i;
const BARE_ID_RE = /^[a-z]{32}$/i;

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
    `Invalid extension URL or ID: "${input}". Expected a Chrome Web Store URL, Edge Add-ons URL, or a 32-character extension ID.`
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun test test/url-parser.test.ts
```
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/url-parser.ts test/url-parser.test.ts
git commit -m "feat: add URL parser for Chrome/Edge store URLs and bare IDs"
```
