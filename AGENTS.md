# Agents.md — chrome-ext-manager (ext-cli)

This document provides instructions for AI agents working on this codebase.
It covers commands, technologies, project structure, and best practices.

---

## Project Overview

`ext-cli` is a CLI tool for downloading, extracting, packing, and searching
Chrome/Edge browser extensions. It parses CRX v2/v3 files, communicates with
the Chrome Web Store and Edge Add-ons APIs, and can build standalone binaries.

---

## Technologies

| Category | Technology | Notes |
|---|---|---|
| Runtime | **Bun** >= 1.3.0 | Required — do not use Node.js, npm, yarn, or pnpm |
| Language | **TypeScript** (strict mode) | ESNext target, bundler module resolution |
| CLI Framework | **commander** ^15.0.0 | Argument parsing and help generation |
| Crypto / Keys | **node-forge** ^1.4.0 | RSA key generation and CRX signing |
| Linter / Formatter | **Biome** ^2.5.2 | Replaces ESLint + Prettier |
| Testing | **bun:test** | Built-in test runner with `describe`, `test`, `expect` |
| Shell | **PowerShell** | All shell commands must be PowerShell-compatible (Windows) |

---

## Project Structure

```
chrome-ext-manager/
├── src/
│   ├── cli.ts            # CLI entry point (commander)
│   ├── index.ts          # Public API exports
│   ├── url-parser.ts     # Parse store URLs → { id, store }
│   ├── crx-parser.ts     # CRX v2/v3 binary header parsing
│   ├── downloader.ts     # Fetch CRX from Chrome/Edge stores
│   ├── extractor.ts      # Extract CRX → directory
│   ├── packer.ts         # Directory → signed CRX3 file
│   └── search.ts         # Search Chrome Web Store & Edge Add-ons
├── test/
│   ├── crx-parser.test.ts
│   ├── extractor.test.ts
│   ├── packer.test.ts
│   └── url-parser.test.ts
├── docs/superpowers/plans/
├── biome.json
├── tsconfig.json
├── package.json
└── bun.lock
```

### Module Responsibilities

| Module | Input | Output | Key Function |
|---|---|---|---|
| `url-parser.ts` | Store URL or bare ID | `StoreInfo { id, store }` | `parseStoreUrl()` |
| `crx-parser.ts` | CRX `Buffer` | `CrxInfo { version, headerLength, zipOffset }` | `parseCrxHeader()`, `extractZipFromCrx()` |
| `downloader.ts` | URL or ID + output dir | Path to saved `.crx` file | `downloadExtension()` |
| `extractor.ts` | `.crx` file path + output dir | Path to extracted directory | `extractCrx()` |
| `packer.ts` | Extension directory + optional output path | Path to packed `.crx` file | `packCrx()` |
| `search.ts` | Search query | `SearchResult[]` | `searchExtensions()` |
| `cli.ts` | CLI arguments | Console output / exit code | Commander program |

---

## Useful Commands

### Setup

```bash
bun install                  # Install all dependencies
```

### Development

```bash
bun run src/cli.ts search "ublock"         # Run CLI directly
bun run src/cli.ts get <url-or-id> -e      # Download + extract
bun run src/cli.ts extract <file.crx>      # Extract CRX
bun run src/cli.ts pack <directory>        # Pack directory to CRX
```

### Quality Checks

```bash
bun run typecheck             # TypeScript type checking (tsc --noEmit)
bun run lint                  # Biome lint check (src/ + test/)
bun run lint:fix              # Biome lint with auto-fix
bun run format                # Biome format (src/ + test/)
bun run check                 # Format + lint:fix + typecheck (all-in-one)
```

### Testing

```bash
bun test                      # Run all tests
bun test test/url-parser.test.ts           # Run a single test file
bun test --filter "parseStoreUrl"          # Run tests matching a name
```

### Build

```bash
bun run build                 # Builds dist/ext-cli.exe (runs prebuild check first)
```

### Prebuild Pipeline

The `prebuild` script runs `bun run check` (format → lint:fix → typecheck)
before any build. This means the build will fail if code quality checks fail.

---

## Architecture Notes

### CRX Format

- CRX files start with the magic bytes `Cr24`
- Version is stored as a 32-bit LE integer at offset 4 (2 or 3)
- A header length (32-bit LE) follows at offset 8
- The ZIP payload starts at offset `12 + headerLength`
- CRX3 adds a protobuf `AsymmetricKeyProof` with the public key and signature

### Download Flow

1. `parseStoreUrl()` resolves the URL/ID to a `StoreInfo` object
2. A download URL is constructed per store (Chrome or Edge)
3. The response is fetched with a browser-like User-Agent
4. The CRX magic bytes are verified before writing to disk

### Extract Flow

1. The CRX file is read into a `Buffer`
2. `extractZipFromCrx()` slices the buffer to get the ZIP payload
3. A temp ZIP is written, then extracted via PowerShell `Expand-Archive`
4. The temp ZIP is cleaned up

### Pack Flow

1. A `key.pem` is loaded or generated (2048-bit RSA via `node-forge`)
2. The extension directory is zipped via PowerShell `Compress-Archive`
3. A CRX3 header is built: protobuf-encoded `AsymmetricKeyProof` with the public key and a SHA-256-based RSA signature
4. The final CRX is assembled: magic + version + header length + header + ZIP data

### Key Implementation Details

- **`safeBinaryEncode()`** in `packer.ts` avoids stack overflow by encoding buffers in 8KB chunks instead of using `String.fromCharCode.apply()` on the full buffer
- **`computeExtensionId()`** hashes the DER public key with SHA-256, takes the first 16 bytes, and maps each byte to a letter in the alphabet `a-p` (base-16 encoding, not base-26)
- **Protobuf encoding** is done manually with `encodeVarint()` and `encodeField()` helpers — no protobuf library is used at runtime

---

## Best Practices & Guidelines

### Runtime & Package Management

- **Always use `bun`** — never npm, yarn, or pnpm
- Lock file is `bun.lock` — commit it when dependencies change
- Dev dependencies: `@biomejs/biome`, `@types/bun`, `@types/node`, `@types/node-forge`

### Shell Commands

- **Always use PowerShell-compatible commands** — this project targets Windows
- Use `dir` or `Get-ChildItem` instead of `ls -la`
- Use `Remove-Item -Recurse` instead of `rm -rf`
- Use `Copy-Item` instead of `cp`, `Move-Item` instead of `mv`
- Use `Get-Content` instead of `cat` for reading files
- When spawning shell commands in code (e.g., in `extractor.ts` and `packer.ts`), use `powershell -Command "..."` with proper quoting

### Code Style (Biome)

- Indent with **2 spaces** (no tabs)
- Max line width: **100 characters**
- Use **double quotes** for strings
- Always use **semicolons**
- Warn on unused variables and imports (`noUnusedVariables`, `noUnusedImports`)

### Error Handling

- CLI commands wrap action handlers in `try/catch` and call `process.exit(1)` on error
- Error messages use `error instanceof Error ? error.message : error` pattern
- Network errors include HTTP status codes in messages
- CRX validation checks magic bytes and throws descriptive errors before writing files

### Testing

- Tests use `bun:test` (import `describe`, `test`, `expect` from `"bun:test"`)
- Use `beforeEach` / `afterEach` for setup/teardown with temp directories
- Clean up temp directories with `rmSync(dir, { recursive: true, force: true })`
- Tests construct synthetic CRX files in-memory or from real zips
- No external fixtures are committed — tests are self-contained

### TypeScript

- Strict mode is enabled — all types must be explicit or inferrable
- Target ESNext with bundler module resolution
- Use `node:` prefix for Node.js built-in imports (e.g., `node:fs/promises`, `node:path`)
- Avoid `any` — use `unknown` and narrow with type guards
- Export public API through `src/index.ts`

### Security

- **Never commit `.pem` key files** — they are auto-generated per extension directory
- Validate downloaded CRX files by checking magic bytes before writing
- Do not trust external input (URLs, file contents) without validation
- The `.gitignore` already excludes `.env` files and build artifacts

### Commit Conventions

Use conventional commits:

```
feat: add new feature
fix: correct a bug
test: add or update tests
refactor: improve code structure
docs: update documentation
chore: maintenance tasks
```

### Module Boundaries

- Each module has a single responsibility
- Dependencies flow downward: `cli.ts` → `downloader` / `extractor` / `packer` / `search` → `url-parser` / `crx-parser`
- `crx-parser.ts` and `url-parser.ts` are leaf modules with no internal dependencies
- `search.ts` is independent — it scrapes store HTML and does not use the downloader

### Network Requests

- User-Agent is set to Chrome 131 to avoid blocks from store servers
- `redirect: "follow"` is used for CRX downloads (stores redirect to CDN)
- HTML scraping is used for search (stores do not provide public APIs)
- Errors from non-200 responses are thrown immediately

### Adding New Features

1. Write tests first (TDD encouraged)
2. Run `bun test` to verify they fail
3. Implement the feature
4. Run `bun run check` to verify formatting, linting, and types
5. Run `bun test` again to verify all tests pass
6. Commit with a conventional commit message

### File Naming

- Source files: `kebab-case.ts` (e.g., `url-parser.ts`, `crx-parser.ts`)
- Test files: `<module>.test.ts` in the `test/` directory
- No barrel files beyond `src/index.ts`
