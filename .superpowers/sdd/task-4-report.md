# Task 4: Downloader Module — Report

## Status: DONE

## What was implemented
`src/downloader.ts` — a function that downloads CRX files from the Chrome Web Store or Edge Add-ons.

## API
```typescript
export async function downloadExtension(
  urlOrId: string,       // full store URL or bare 32-char extension ID
  outputDir: string = "." // directory to save the .crx file
): Promise<string>        // returns path to saved .crx file
```

## Key design decisions
- Followed the brief exactly — no deviations.
- Uses `parseStoreUrl` from Task 2's URL parser to resolve input to `{ id, store }`.
- Template-based URL construction for Chrome and Edge CRX endpoints.
- Sets a browser-like `User-Agent` header to avoid store blocks.
- Validates CRX magic bytes (`Cr24`) before writing to disk.
- Creates output directory recursively if it doesn't exist.
- Logs download progress and file size.

## Verification
- `bun run src/cli.ts` — still works (imports are clean).
- No type errors detected.

## Commit
`1ee51fe` — feat: add downloader for Chrome Web Store and Edge Add-ons CRX files

## Concerns
None. Implementation matches the brief exactly.
