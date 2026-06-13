export const COURSE_FORMATS = [
  { label: "Live", value: "live" },
  { label: "Home Study", value: "home-study" },
  { label: "In Person", value: "in-person" },
] as const satisfies ReadonlyArray<{ label: string; value: string }>

export type CourseFormatValue = (typeof COURSE_FORMATS)[number]["value"]

export const COURSE_FORMAT_VALUES = COURSE_FORMATS.map(
  (format) => format.value
) as ReadonlyArray<CourseFormatValue>
