import type { summarizeLicense } from "@repo/rules-engine/evaluators/summarizeLicense"
import { RULE_SETS } from "@repo/rules-engine/rule-sets"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

type SummarizeArgs = Parameters<typeof summarizeLicense>[0]
type SummarizeReturn = ReturnType<typeof summarizeLicense>

const SENTINEL_SUMMARY = { isComplete: false } as unknown as SummarizeReturn

const findMock = vi.fn()
const summarizeLicenseMock = vi.fn(
  (_args: SummarizeArgs): SummarizeReturn => SENTINEL_SUMMARY
)

vi.mock("server-only", () => ({}))
vi.mock("~/payload.config", () => ({ default: {} }))
vi.mock("payload", () => ({
  getPayload: vi.fn(() => Promise.resolve({ find: findMock })),
}))
vi.mock("@repo/rules-engine/evaluators/summarizeLicense", () => ({
  summarizeLicense: summarizeLicenseMock,
}))

const { getDashboardData } = await import("./get-dashboard-data")

const license = (overrides: Record<string, unknown> = {}) => ({
  id: "license-1",
  issuedAt: "2025-01-01T00:00:00.000Z",
  licenseNumber: "ABC-123",
  licenseType: "LCSW",
  reactivationDate: null,
  renewalCycleMonths: 24,
  state: "CA",
  status: "active",
  ...overrides,
})

const creditRow = {
  approvingBody: "APA",
  completedAt: "2025-12-01T00:00:00.000Z",
  course: "course-1",
  creditedCategories: ["law-and-ethics"],
  creditedHours: 6,
  evaluatedAt: "2025-12-02T00:00:00.000Z",
  format: "live",
  license: "license-1",
  ruleSetVersion: 1,
}

const TODAY = new Date("2026-06-11T00:00:00.000Z")

beforeEach(() => {
  findMock.mockReset()
  summarizeLicenseMock.mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("getDashboardData", () => {
  it("reconstructs credits and summarizes each active license", async () => {
    findMock.mockImplementation(({ collection }: { collection: string }) =>
      collection === "licenses"
        ? Promise.resolve({ docs: [license()] })
        : Promise.resolve({ docs: [creditRow] })
    )

    const data = await getDashboardData("practitioner-1", TODAY)

    expect(data.licenses).toHaveLength(1)
    expect(data.licenses[0]?.summary).toBe(SENTINEL_SUMMARY)
    expect(data.licenses[0]?.state).toBe("CA")

    const args = summarizeLicenseMock.mock.calls[0]?.[0]
    expect(args?.ruleSet).toBe(RULE_SETS["CA-LCSW"])
    expect(args?.license.issuedAt).toBeInstanceOf(Date)
    expect(args?.credits[0]?.courseId).toBe("course-1")
    expect(args?.credits[0]?.completedAt).toBeInstanceOf(Date)
    expect(args?.credits[0]?.format).toBe("live")
  })

  it("returns a null summary and skips summarize when no rule set ships", async () => {
    findMock.mockImplementation(({ collection }: { collection: string }) =>
      collection === "licenses"
        ? Promise.resolve({
            docs: [license({ licenseType: "LPC", state: "TX" })],
          })
        : Promise.resolve({ docs: [] })
    )

    const data = await getDashboardData("practitioner-1", TODAY)

    expect(data.licenses[0]?.summary).toBeNull()
    expect(summarizeLicenseMock).not.toHaveBeenCalled()
  })
})
