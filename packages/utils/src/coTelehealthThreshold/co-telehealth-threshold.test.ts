import { describe, expect, it } from "vitest"
import { coTelehealthNotificationType } from "./index"

describe("coTelehealthNotificationType", () => {
  it("maps each threshold to its CO telehealth notification type", () => {
    expect(coTelehealthNotificationType(90)).toBe("co-telehealth-90d")
    expect(coTelehealthNotificationType(60)).toBe("co-telehealth-60d")
    expect(coTelehealthNotificationType(30)).toBe("co-telehealth-30d")
    expect(coTelehealthNotificationType(7)).toBe("co-telehealth-7d")
    expect(coTelehealthNotificationType(1)).toBe("co-telehealth-1d")
  })
})
