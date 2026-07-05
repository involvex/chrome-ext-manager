// src/extractor.ts
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { extractZipFromCrx } from "./crx-parser";

export async function extractCrx(crxPath: string, outputDir?: string): Promise<string> {
  const crxBuffer = await readFile(crxPath);
  const zipBuffer = extractZipFromCrx(crxBuffer);

  const baseName = basename(crxPath, ".crx");
  const destDir = outputDir ?? join(".", baseName);
  await mkdir(destDir, { recursive: true });

  const tempZip = join(destDir, "__temp__.zip");
  await writeFile(tempZip, zipBuffer);

  const proc = Bun.spawn([
    "powershell",
    "-Command",
    `Expand-Archive -Path '${tempZip}' -DestinationPath '${destDir}' -Force`,
  ]);
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`Failed to extract ZIP: ${stderr}`);
  }

  const { unlink } = await import("node:fs/promises");
  await unlink(tempZip);

  console.log(`Extracted to: ${destDir}`);
  return destDir;
}
