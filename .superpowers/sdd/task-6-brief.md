# Task 6: Packer Module

**Files:**
- Create: `src/packer.ts`
- Create: `test/packer.test.ts`

**Interfaces:**
- Consumes: none
- Produces: `packCrx(dirPath: string, outputPath?: string): Promise<string>` — returns path to packed .crx file

- [ ] **Step 1: Write failing tests**

```typescript
// test/packer.test.ts
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { packCrx } from "../src/packer";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const TEST_DIR = join(import.meta.dir, "__test_pack__");

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

test("packCrx creates a CRX file from directory", async () => {
  const extDir = join(TEST_DIR, "my-ext");
  mkdirSync(extDir, { recursive: true });
  writeFileSync(
    join(extDir, "manifest.json"),
    JSON.stringify({ manifest_version: 3, name: "Test Ext", version: "1.0" })
  );

  const crxPath = join(TEST_DIR, "output.crx");
  const result = await packCrx(extDir, crxPath);

  expect(existsSync(result)).toBe(true);

  const buf = readFileSync(result);
  expect(buf.toString("ascii", 0, 4)).toBe("Cr24");
  expect(buf.readUInt32LE(4)).toBe(3);
});

test("packCrx generates .pem key if none exists", async () => {
  const extDir = join(TEST_DIR, "my-ext2");
  mkdirSync(extDir, { recursive: true });
  writeFileSync(
    join(extDir, "manifest.json"),
    JSON.stringify({ manifest_version: 3, name: "Test", version: "1.0" })
  );

  await packCrx(extDir, join(TEST_DIR, "out.crx"));
  expect(existsSync(join(extDir, "key.pem"))).toBe(true);
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test test/packer.test.ts
```
Expected: FAIL — `packCrx` not found

- [ ] **Step 3: Implement packer.ts**

The packer must:
1. Read manifest.json from the directory to validate it's an extension
2. Load existing key.pem or generate a new 2048-bit RSA key using node-forge
3. Create a ZIP archive from the directory contents (use PowerShell Compress-Archive on Windows)
4. Build a CRX3 header with the public key and a SHA256 signature
5. Assemble: magic "Cr24" + version(3) + headerLen + header + zipData
6. Write to output path and return it

Key implementation details:
- Use `node-forge` for RSA key generation and signing
- CRX3 protobuf header format: field 2 (sha256_with_rsa) contains AsymmetricKeyProof with field 1 (public_key DER) and field 2 (signature)
- Extension ID is computed as first 16 bytes of SHA256(public_key DER), base-16 encoded with alphabet "abcdefghijklmnop"
- ZIP creation: use `Bun.spawn` with PowerShell `Compress-Archive` on Windows

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun test test/packer.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/packer.ts test/packer.test.ts
git commit -m "feat: add CRX3 packer with auto key generation"
```
