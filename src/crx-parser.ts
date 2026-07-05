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
