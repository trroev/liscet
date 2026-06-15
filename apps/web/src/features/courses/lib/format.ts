import { TZDate } from "@date-fns/tz"
import type { Course } from "@repo/payload/payload-types"
import { format as formatDate } from "date-fns/format"
import { match } from "ts-pattern"

export const formatCourseDate = (iso: string): string =>
  formatDate(new TZDate(iso, "UTC"), "MMM d, yyyy")

export const formatHours = (hours: number): string =>
  `${hours} ${hours === 1 ? "hour" : "hours"}`

export const formatCourseFormat = (format: Course["format"]): string =>
  match(format)
    .with("live", () => "Live")
    .with("home-study", () => "Home Study")
    .with("in-person", () => "In Person")
    .exhaustive()
