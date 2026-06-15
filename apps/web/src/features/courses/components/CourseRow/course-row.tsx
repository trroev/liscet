import { Badge } from "@repo/ui/components/Badge"
import {
  formatCourseDate,
  formatCourseFormat,
  formatHours,
} from "../../lib/format"
import type { CourseCreditView, CourseView } from "../../lib/types"
import { CertificateDownload } from "../CertificateDownload"

export type CourseRowProps = {
  course: CourseView
}

type DetailProps = {
  label: string
  value: string
}

const Detail = ({ label, value }: DetailProps): React.JSX.Element => (
  <div className="space-y-1">
    <dt className="font-sans text-body-sm text-text-muted">{label}</dt>
    <dd className="font-sans text-body text-text-primary tabular-nums">
      {value}
    </dd>
  </div>
)

const CreditRow = ({
  credit,
}: {
  credit: CourseCreditView
}): React.JSX.Element => (
  <li className="space-y-1 rounded-md border border-border bg-surface-raised px-3 py-2">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="font-sans text-body-sm text-text-primary">
        {credit.licenseLabel}
        {credit.licenseNumber ? ` · #${credit.licenseNumber}` : ""}
      </span>
      <span className="font-sans text-body-sm text-text-secondary tabular-nums">
        {formatHours(credit.creditedHours)}
      </span>
    </div>
    {credit.creditedCategories.length > 0 ? (
      <p className="font-sans text-caption text-text-muted">
        {credit.creditedCategories.join(", ")}
      </p>
    ) : null}
  </li>
)

export const CourseRow = ({ course }: CourseRowProps): React.JSX.Element => (
  <section className="space-y-5 rounded-lg border border-border bg-surface p-5 sm:p-6">
    <header className="flex flex-wrap-reverse items-end justify-between gap-x-4 gap-y-2">
      <div className="space-y-1">
        <h2 className="font-display text-heading-md text-text-primary">
          {course.title}
        </h2>
        {course.provider ? (
          <p className="font-sans text-body-sm text-text-muted">
            {course.provider}
          </p>
        ) : null}
      </div>
      <Badge variant="muted">{formatCourseFormat(course.format)}</Badge>
    </header>

    <dl className="grid grid-cols-2 gap-4">
      <Detail label="Completed" value={formatCourseDate(course.completedAt)} />
      <Detail label="Hours" value={formatHours(course.hours)} />
    </dl>

    {course.credits.length > 0 ? (
      <div className="space-y-2">
        <p className="font-sans text-body-sm text-text-muted">Credited to</p>
        <ul className="space-y-2">
          {course.credits.map((credit) => (
            <CreditRow credit={credit} key={credit.id} />
          ))}
        </ul>
      </div>
    ) : (
      <Badge variant="muted">Not yet credited</Badge>
    )}

    {course.hasCertificate ? (
      <CertificateDownload courseId={course.id} />
    ) : null}
  </section>
)
