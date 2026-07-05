// src/downloader.ts
import { parseStoreUrl } from "./url-parser";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const CHROME_CRX_URL =
  "https://clients2.google.com/service/update2/crx?response=redirect&prodversion=131.0&acceptformat=crx2,crx3&x=id%3D{ID}%26uc";

const EDGE_CRX_URL =
  "https://edge.microsoft.com/extensionwebstorebase/v1/crx?response=redirect&x=id%3D{ID}%26installsource%3Dondemand%26uc";

function buildDownloadUrl(id: string, store: "chrome" | "edge"): string {
  const template = store === "chrome" ? CHROME_CRX_URL : EDGE_CRX_URL;
  return template.replace("{ID}", id);
}

/**
 * Download a CRX file from the Chrome Web Store or Edge Add-ons.
 * Accepts a full store URL or a bare 32-char extension ID.
 * Returns the path to the saved .crx file.
 */
export async function downloadExtension(
  urlOrId: string,
  outputDir: string = ".",
): Promise<string> {
  const { id, store } = parseStoreUrl(urlOrId);
  const downloadUrl = buildDownloadUrl(id, store);

  console.log(`Downloading ${store} extension: ${id}`);
  console.log(`URL: ${downloadUrl}`);

  const response = await fetch(downloadUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(
      `Download failed: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Verify it's a valid CRX file
  const magic = buffer.toString("ascii", 0, 4);
  if (magic !== "Cr24") {
    throw new Error(
      `Invalid CRX response: got "${magic}" instead of "Cr24". The extension may not exist or the store may have changed.`,
    );
  }

  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  const outputPath = join(outputDir, `${id}.crx`);
  await writeFile(outputPath, buffer);

  console.log(`Saved: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return outputPath;
}
