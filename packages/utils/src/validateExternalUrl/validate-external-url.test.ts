import { describe, expect, it } from "vitest"
import { validateExternalUrl } from "./index"

describe("validateExternalUrl", () => {
  describe("accepts", () => {
    it("accepts http URLs", () => {
      const result = validateExternalUrl("http://example.com/path")
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.url.hostname).toBe("example.com")
      }
    })

    it("accepts https URLs", () => {
      const result = validateExternalUrl("https://example.com")
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.url.protocol).toBe("https:")
      }
    })

    it("accepts URLs with query strings and fragments", () => {
      const result = validateExternalUrl("https://example.com/x?y=1#z")
      expect(result.ok).toBe(true)
    })
  })

  describe("rejects disallowed protocols", () => {
    it.each([
      ["javascript:alert(1)"],
      ["data:text/html,<script>alert(1)</script>"],
      ["vbscript:msgbox(1)"],
      ["file:///etc/passwd"],
      ["ftp://example.com"],
    ])("rejects %s", (input) => {
      const result = validateExternalUrl(input)
      expect(result).toEqual({ ok: false, reason: "disallowed_protocol" })
    })
  })

  describe("rejects malformed input", () => {
    it.each([
      [""],
      ["not a url"],
      ["http://"],
      ["://example.com"],
    ])("rejects %s", (input) => {
      const result = validateExternalUrl(input)
      expect(result).toEqual({ ok: false, reason: "invalid_url" })
    })
  })

  describe("allowlist", () => {
    it("accepts hosts on the allowlist", () => {
      const result = validateExternalUrl("https://example.com/x", {
        allowedHosts: ["example.com", "other.com"],
      })
      expect(result.ok).toBe(true)
    })

    it("matches allowlist case-insensitively", () => {
      const result = validateExternalUrl("https://Example.COM", {
        allowedHosts: ["EXAMPLE.com"],
      })
      expect(result.ok).toBe(true)
    })

    it("rejects hosts not on the allowlist", () => {
      const result = validateExternalUrl("https://evil.com", {
        allowedHosts: ["example.com"],
      })
      expect(result).toEqual({ ok: false, reason: "host_not_allowed" })
    })

    it("does not implicitly allow subdomains", () => {
      const result = validateExternalUrl("https://sub.example.com", {
        allowedHosts: ["example.com"],
      })
      expect(result).toEqual({ ok: false, reason: "host_not_allowed" })
    })

    it("rejects disallowed protocol before checking allowlist", () => {
      const result = validateExternalUrl("javascript:alert(1)", {
        allowedHosts: ["example.com"],
      })
      expect(result).toEqual({ ok: false, reason: "disallowed_protocol" })
    })
  })
})
