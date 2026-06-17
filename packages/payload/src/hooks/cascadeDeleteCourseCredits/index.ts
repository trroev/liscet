import type { CollectionBeforeDeleteHook } from "payload"

type CourseCreditParent = "course" | "license"

const cascadeDeleteCourseCreditsBy =
  (parent: CourseCreditParent): CollectionBeforeDeleteHook =>
  async ({ id, req }): Promise<void> => {
    await req.payload.delete({
      collection: "course-credits",
      overrideAccess: true,
      req,
      where: { [parent]: { equals: id } },
    })
  }

export const cascadeDeleteCourseCreditsOnCourseDelete =
  cascadeDeleteCourseCreditsBy("course")

export const cascadeDeleteCourseCreditsOnLicenseDelete =
  cascadeDeleteCourseCreditsBy("license")
