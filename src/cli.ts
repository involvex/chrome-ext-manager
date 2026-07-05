#!/usr/bin/env bun

import { Command } from "commander";
import { downloadExtension } from "./downloader";
import { extractCrx } from "./extractor";
import { packCrx } from "./packer";

const program = new Command();

program
  .name("ext-cli")
  .description("Chrome/Edge Extension Manager - download, extract, and pack extensions")
  .version("1.0.0");

program
  .command("get")
  .description("Download an extension from Chrome Web Store or Edge Add-ons")
  .argument("<url-or-id>", "Store URL or 32-char extension ID")
  .option("-d, --dir <directory>", "Output directory", ".")
  .option("-e, --extract", "Extract the CRX after downloading")
  .action(async (urlOrId: string, opts: { dir: string; extract: boolean }) => {
    try {
      const crxPath = await downloadExtension(urlOrId, opts.dir);

      if (opts.extract) {
        const extDir = crxPath.replace(/\.crx$/, "");
        await extractCrx(crxPath, extDir);
        console.log(`\nDone! Extension extracted to: ${extDir}`);
      } else {
        console.log(`\nDone! CRX saved to: ${crxPath}`);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program
  .command("extract")
  .description("Extract a CRX file to a directory")
  .argument("<crx-file>", "Path to .crx file")
  .option("-d, --dir <directory>", "Output directory")
  .action(async (crxFile: string, opts: { dir?: string }) => {
    try {
      const outputDir = opts.dir ?? crxFile.replace(/\.crx$/, "");
      await extractCrx(crxFile, outputDir);
      console.log(`\nDone! Extracted to: ${outputDir}`);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program
  .command("pack")
  .description("Pack a directory into a CRX file")
  .argument("<directory>", "Extension directory containing manifest.json")
  .option("-o, --output <path>", "Output CRX file path")
  .action(async (directory: string, opts: { output?: string }) => {
    try {
      const crxPath = await packCrx(directory, opts.output);
      console.log(`\nDone! Packed to: ${crxPath}`);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  });

program.parse();
