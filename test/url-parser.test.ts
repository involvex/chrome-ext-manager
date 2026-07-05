import { describe, test, expect } from "bun:test";
import { parseStoreUrl } from "../src/url-parser";

describe("parseStoreUrl", () => {
  test("parses Chrome Web Store URL", () => {
    const result = parseStoreUrl(
      "https://chromewebstore.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm",
    );
    expect(result).toEqual({
      id: "cjpalhdlnbpafiamejdnhcphjbkeiagm",
      store: "chrome",
    });
  });

  test("parses Chrome URL with query params", () => {
    const result = parseStoreUrl(
      "https://chromewebstore.google.com/detail/ext-name/abcdef1234567890abcdef12?hl=en",
    );
    expect(result).toEqual({ id: "abcdef1234567890abcdef12", store: "chrome" });
  });

  test("parses Edge Add-ons URL", () => {
    const result = parseStoreUrl(
      "https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak",
    );
    expect(result).toEqual({
      id: "odfafepnkmbhccpbejgmiehpchacaeak",
      store: "edge",
    });
  });

  test("parses bare 32-char extension ID as chrome", () => {
    const result = parseStoreUrl("cjpalhdlnbpafiamejdnhcphjbkeiagm");
    expect(result).toEqual({
      id: "cjpalhdlnbpafiamejdnhcphjbkeiagm",
      store: "chrome",
    });
  });

  test("throws on invalid input", () => {
    expect(() => parseStoreUrl("")).toThrow();
    expect(() => parseStoreUrl("not-a-valid-id!")).toThrow();
  });
});
