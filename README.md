# ext-cli

A CLI tool for downloading, extracting, packing, and searching Chrome/Edge extensions.

## Features

- Download extensions from Chrome Web Store and Edge Add-ons
- Extract CRX files to directories
- Pack directories into signed CRX files
- Search for extensions in both stores

## Installation

### From source

```bash
git clone https://github.com/yourusername/chrome-ext-manager.git
cd chrome-ext-manager
bun install
```

### Build binary

```bash
bun run build
```

This creates `dist/ext-cli.exe`.

## Usage

### Search for extensions

```bash
ext-cli search "ublock"
ext-cli search "dark reader"
ext-cli search "ad blocker"
```

### Download an extension

From a Chrome Web Store URL:

```bash
ext-cli get "https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm"
```

From an Edge Add-ons URL:

```bash
ext-cli get "https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odionnohbojikenmjlgaemjcdhjlhpgf"
```

From a bare extension ID:

```bash
ext-cli get cjpalhdlnbpafiamejdnhcphjbkeiagm
```

With extraction:

```bash
ext-cli get "https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm" -e
```

To a specific directory:

```bash
ext-cli get cjpalhdlnbpafiamejdnhcphjbkeiagm -d ./extensions
```

### Extract a CRX file

```bash
ext-cli extract extension.crx
ext-cli extract extension.crx -d ./output
```

### Pack a directory into CRX

```bash
ext-cli pack ./extension-dir
ext-cli pack ./extension-dir -o output.crx
```

## Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.0

### Setup

```bash
bun install
```

### Commands

```bash
# Run the CLI
bun run src/cli.ts search "ublock"

# Run tests
bun test

# Type check
bun run typecheck

# Lint
bun run lint

# Format
bun run format

# Build binary
bun run build
```

## Architecture

- `src/cli.ts` - CLI entry point with commander
- `src/url-parser.ts` - Parse store URLs and extension IDs
- `src/downloader.ts` - Download CRX files from stores
- `src/extractor.ts` - Extract CRX to directories
- `src/packer.ts` - Pack directories into signed CRX3 files
- `src/search.ts` - Search Chrome Web Store and Edge Add-ons

## License

MIT
