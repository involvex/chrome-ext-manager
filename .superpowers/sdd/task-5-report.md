# Task 5: Extractor Module — Report

## Files Created
- `src/extractor.ts` — CRX extractor using `extractZipFromCrx` from crx-parser
- `test/extractor.test.ts` — Test that builds a CRX, extracts it, and verifies manifest.json exists

## Implementation Notes
- Uses `Bun.spawn` with PowerShell `Expand-Archive` to unzip the extracted ZIP buffer
- Creates a temp zip in the destination dir, extracts, then cleans up the temp file
- Default output dir falls back to `./<crx-basename>` if no `outputDir` provided
- The test requires `--timeout 30000` to account for PowerShell startup overhead on Windows

## Test Results
```
12 pass, 0 fail across 4 test files
```

## Commit
- `7c57087` — feat: add CRX extractor that unzips CRX files to directories

## Concerns
- The default bun test timeout (5s) is insufficient for PowerShell processes on Windows; the `bun.lock` changed (likely from the test run). Tests must be run with `--timeout 30000`.
