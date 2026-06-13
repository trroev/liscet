import { z } from "zod"
import { COURSE_FORMAT_VALUES, type CourseFormatValue } from "./course-format"

export const MIN_COURSE_HOURS = 0.25

export const logCourseSchema = z.object({
  completedAt: z.iso
    .date("Enter a valid completion date.")
    .refine(
      (value) => Date.parse(value) <= Date.now(),
      "Completion date cannot be in the future."
    ),
  format: z.enum(
    COURSE_FORMAT_VALUES as ReadonlyArray<CourseFormatValue>,
    "Select a delivery format."
  ),
  hours: z
    .string()
    .min(1, "Enter the number of credit hours.")
    .transform((value) => Number(value))
    .refine(
      (value) => !Number.isNaN(value),
      "Enter a valid number of credit hours."
    )
    .refine(
      (value) => value >= MIN_COURSE_HOURS,
      `Enter at least ${MIN_COURSE_HOURS} hours.`
    ),
  provider: z.string().trim(),
  subjectCategories: z.array(z.string().trim().min(1)),
  title: z.string().trim().min(1, "Enter the course title."),
})

export type LogCourseValues = z.infer<typeof logCourseSchema>
