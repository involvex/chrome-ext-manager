// test/crx-parser.test.ts
import { describe, expect, test } from "bun:test";
import { extractZipFromCrx, parseCrxHeader } from "../src/crx-parser";

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
