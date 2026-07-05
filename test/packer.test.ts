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
    JSON.stringify({ manifest_version: 3, name: "Test Ext", version: "1.0" }),
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
    JSON.stringify({ manifest_version: 3, name: "Test", version: "1.0" }),
  );

  await packCrx(extDir, join(TEST_DIR, "out.crx"));
  expect(existsSync(join(extDir, "key.pem"))).toBe(true);
});
