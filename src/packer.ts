import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import forge from "node-forge";

const ALPHABET = "abcdefghijklmnop";
const CHUNK_SIZE = 8192;

/**
 * Safely encode a Buffer to a forge binary string without stack overflow.
 * forge.util.binary.raw.encode uses String.fromCharCode.apply which
 * overflows the stack for large buffers.
 */
function safeBinaryEncode(buf: Buffer): string {
  let result = "";
  for (let i = 0; i < buf.length; i += CHUNK_SIZE) {
    result += String.fromCharCode.apply(
      null,
      buf.subarray(i, i + CHUNK_SIZE) as unknown as number[],
    );
  }
  return result;
}

function computeExtensionId(publicKeyDer: Buffer): string {
  const md = forge.md.sha256.create();
  md.update(forge.util.binary.raw.encode(publicKeyDer));
  const hash = forge.util.binary.raw.decode(md.digest().getBytes());
  const idBytes = Array.from(hash.slice(0, 16));
  return idBytes.map((b: number) => ALPHABET[b % 16]).join("");
}

function encodeVarint(value: number): number[] {
  const bytes: number[] = [];
  while (value > 0x7f) {
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  bytes.push(value & 0x7f);
  return bytes;
}

function encodeField(fieldNumber: number, wireType: number, data: number[]): number[] {
  const tag = encodeVarint((fieldNumber << 3) | wireType);
  return [...tag, ...encodeVarint(data.length), ...data];
}

function buildCrx3Header(publicKeyDer: Buffer, signature: Buffer): Buffer {
  const _pubKeyProof = encodeField(1, 2, [
    ...encodeField(1, 2, Array.from(publicKeyDer)),
    ...encodeField(2, 2, Array.from(signature)),
  ]);

  const asp = encodeField(2, 2, [
    ...encodeField(1, 2, Array.from(publicKeyDer)),
    ...encodeField(2, 2, Array.from(signature)),
  ]);

  const header = encodeField(1, 2, asp);
  return Buffer.from(header);
}

export async function packCrx(dirPath: string, outputPath?: string): Promise<string> {
  const manifestPath = join(dirPath, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error("No manifest.json found in directory");
  }

  JSON.parse(readFileSync(manifestPath, "utf-8"));

  const keyPath = join(dirPath, "key.pem");
  let privateKey: forge.pki.PrivateKey;

  if (existsSync(keyPath)) {
    const pem = readFileSync(keyPath, "utf-8");
    privateKey = forge.pki.privateKeyFromPem(pem);
  } else {
    privateKey = forge.pki.rsa.generateKeyPair({ bits: 2048 }).privateKey;
    const pem = forge.pki.privateKeyToPem(privateKey);
    writeFileSync(keyPath, pem, "utf-8");
  }

  const pubDerBuf = Buffer.from(
    forge.asn1
      .toDer(forge.pki.publicKeyToAsn1(forge.pki.setRsaPublicKey(privateKey.n, privateKey.e)))
      .getBytes(),
    "binary",
  );

  const crxId = computeExtensionId(pubDerBuf);

  const tmpZip = join(dirPath, "..", "__tmp_pack__.zip");
  try {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${join(dirPath, "*")}' -DestinationPath '${tmpZip}' -Force"`,
      { stdio: "pipe" },
    );
  } catch (e: unknown) {
    throw new Error(`Failed to create ZIP: ${e instanceof Error ? e.message : String(e)}`);
  }

  const zipData = readFileSync(tmpZip);

  const signMd = forge.md.sha256.create();
  signMd.update(crxId);
  signMd.update(safeBinaryEncode(zipData));

  const sigBytes = privateKey.sign(signMd);

  const headerBuf = buildCrx3Header(pubDerBuf, Buffer.from(sigBytes, "binary"));

  const out = outputPath ?? join(dirPath, "output.crx");
  const magic = Buffer.from("Cr24");
  const version = Buffer.alloc(4);
  version.writeUInt32LE(3, 0);
  const headerLen = Buffer.alloc(4);
  headerLen.writeUInt32LE(headerBuf.length, 0);

  const result = Buffer.concat([magic, version, headerLen, headerBuf, zipData]);
  writeFileSync(out, result);

  try {
    unlinkSync(tmpZip);
  } catch {}

  return out;
}
