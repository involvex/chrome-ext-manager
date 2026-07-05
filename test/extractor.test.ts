// test/extractor.test.ts
import { afterEach, beforeEach, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extractCrx } from "../src/extractor";

const TEST_DIR = join(import.meta.dir, "__test_extract__");

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

test("extractCrx extracts a CRX file to directory", async () => {
  const zipPath = join(TEST_DIR, "test.zip");

  const extDir = join(TEST_DIR, "ext_src");
  mkdirSync(extDir, { recursive: true });
  writeFileSync(join(extDir, "manifest.json"), JSON.stringify({ name: "test", version: "1.0" }));

  const proc = Bun.spawn([
    "powershell",
    "-Command",
    `Compress-Archive -Path '${extDir}\\*' -DestinationPath '${zipPath}' -Force`,
  ]);
  await proc.exited;

  const zipBuf = Bun.file(zipPath);
  const zipBytes = Buffer.from(await zipBuf.arrayBuffer());

  const crxHeader = Buffer.alloc(12);
  crxHeader.write("Cr24", 0);
  crxHeader.writeUInt32LE(3, 4);
  crxHeader.writeUInt32LE(4, 8);

  const dummyProto = Buffer.alloc(4);
  const crxBuffer = Buffer.concat([crxHeader, dummyProto, zipBytes]);

  const crxPath = join(TEST_DIR, "test.crx");
  writeFileSync(crxPath, crxBuffer);

  const outputDir = join(TEST_DIR, "extracted");
  const result = await extractCrx(crxPath, outputDir);

  expect(existsSync(join(result, "manifest.json"))).toBe(true);
});
