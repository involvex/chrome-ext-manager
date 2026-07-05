# Task 3: CRX Parser Module

**Files:**
- Create: `src/crx-parser.ts`
- Create: `test/crx-parser.test.ts`

**Interfaces:**
- Consumes: none
- Produces: `parseCrxHeader(buffer: Buffer): CrxInfo` and `extractZipFromCrx(buffer: Buffer): Buffer`

- [ ] **Step 1: Write failing tests**

```typescript
// test/crx-parser.test.ts
import { describe, test, expect } from "bun:test";
import { parseCrxHeader, extractZipFromCrx } from "../src/crx-parser";

describe("CRX Parser", () => {
  test("parseCrxHeader reads CRX3 header", () => {
    const header = Buffer.alloc(16);
    header.write("Cr24", 0);
    header.writeUInt32LE(3, 4);
    header.writeUInt32LE(4, 8);
    header.writeUInt32LE(0, 12);

    const info = parseCrxHeader(header);
    expect(info.version).toBe(3);
    expect(info.headerLength).toBe(4);
    expect(info.zipOffset).toBe(16);
  });

  test("parseCrxHeader reads CRX2 header", () => {
    const header = Buffer.alloc(16);
    header.write("Cr24", 0);
    header.writeUInt32LE(2, 4);
    header.writeUInt32LE(4, 8);

    const info = parseCrxHeader(header);
    expect(info.version).toBe(2);
  });

  test("parseCrxHeader throws on invalid magic", () => {
    const bad = Buffer.from("NOTACRX");
    expect(() => parseCrxHeader(bad)).toThrow("Not a CRX file");
  });

  test("extractZipFromCrx returns zip bytes after header", () => {
    const fixed = Buffer.alloc(12);
    fixed.write("Cr24", 0);
    fixed.writeUInt32LE(3, 4);
    fixed.writeUInt32LE(4, 8);

    const protoHeader = Buffer.alloc(4);
    const zipData = Buffer.from("PKZIP_DATA_HERE");

    const crx = Buffer.concat([fixed, protoHeader, zipData]);
    const zip = extractZipFromCrx(crx);

    expect(zip.equals(zipData)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test test/crx-parser.test.ts
```
Expected: FAIL — `parseCrxHeader` not found

- [ ] **Step 3: Implement crx-parser.ts**

```typescript
// src/crx-parser.ts

export interface CrxInfo {
  version: number;
  headerLength: number;
  zipOffset: number;
}

const CRX_MAGIC = "Cr24";

export function parseCrxHeader(buffer: Buffer): CrxInfo {
  if (buffer.length < 12) {
    throw new Error("Not a CRX file: buffer too small");
  }

  const magic = buffer.toString("ascii", 0, 4);
  if (magic !== CRX_MAGIC) {
    throw new Error(`Not a CRX file: invalid magic "${magic}" (expected "${CRX_MAGIC}")`);
  }

  const version = buffer.readUInt32LE(4);
  if (version !== 2 && version !== 3) {
    throw new Error(`Unsupported CRX version: ${version}`);
  }

  const headerLength = buffer.readUInt32LE(8);
  const zipOffset = 12 + headerLength;

  return { version, headerLength, zipOffset };
}

export function extractZipFromCrx(buffer: Buffer): Buffer {
  const info = parseCrxHeader(buffer);
  return buffer.subarray(info.zipOffset);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun test test/crx-parser.test.ts
```
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/crx-parser.ts test/crx-parser.test.ts
git commit -m "feat: add CRX v2/v3 parser for header reading and ZIP extraction"
```
