// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { CourseView } from "../../lib/types"

vi.mock("../CertificateDownload", () => ({
  CertificateDownload: ({ courseId }: { courseId: string }) => (
    <div data-testid="certificate-download">{courseId}</div>
  ),
}))

import { CourseRow } from "./course-row"

const baseCourse: CourseView = {
  completedAt: "2027-03-01T00:00:00.000Z",
  credits: [],
  format: "live",
  hasCertificate: false,
  hours: 3,
  id: "course-1",
  provider: "Provider Inc",
  subjectCategories: ["Ethics"],
  title: "Ethics 101",
}

describe("CourseRow", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders the course title, provider, format, date, and hours", () => {
    render(<CourseRow course={baseCourse} />)

    expect(screen.getByText("Ethics 101")).toBeInTheDocument()
    expect(screen.getByText("Provider Inc")).toBeInTheDocument()
    expect(screen.getByText("Live")).toBeInTheDocument()
    expect(screen.getByText("Mar 1, 2027")).toBeInTheDocument()
    expect(screen.getByText("3 hours")).toBeInTheDocument()
  })

  it("shows a not-yet-credited badge when there are no credits", () => {
    render(<CourseRow course={baseCourse} />)
    expect(screen.getByText("Not yet credited")).toBeInTheDocument()
  })

  it("lists per-license credited hours and categories", () => {
    render(
      <CourseRow
        course={{
          ...baseCourse,
          credits: [
            {
              creditedCategories: ["Ethics", "Law"],
              creditedHours: 3,
              id: "credit-1",
              licenseLabel: "CA LCSW",
              licenseNumber: "ABC-123",
            },
          ],
        }}
      />
    )

    expect(screen.getByText("CA LCSW · #ABC-123")).toBeInTheDocument()
    expect(screen.getByText("Ethics, Law")).toBeInTheDocument()
  })

  it("renders the certificate download only when a certificate exists", () => {
    const { rerender } = render(<CourseRow course={baseCourse} />)
    expect(screen.queryByTestId("certificate-download")).not.toBeInTheDocument()

    rerender(<CourseRow course={{ ...baseCourse, hasCertificate: true }} />)
    expect(screen.getByTestId("certificate-download")).toHaveTextContent(
      "course-1"
    )
  })
})
