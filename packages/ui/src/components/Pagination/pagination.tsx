"use client"

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import { Button } from "@repo/ui/components/Button"
import { getPageItems } from "./pagination.helpers"

export type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const pages = getPageItems({ current: currentPage, total: totalPages })

  return (
    <nav aria-label="pagination" className="flex w-full justify-center">
      <ul className="flex flex-row items-center gap-1">
        <li>
          <Button
            aria-label="Go to previous page"
            className="gap-1.5"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            size="sm"
            variant="ghost"
          >
            <RiArrowLeftSLine aria-hidden="true" size={16} />
            Previous
          </Button>
        </li>

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis items have no stable identity
            <li key={`ellipsis-${index}`}>
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center font-sans text-body text-text-muted"
              >
                …
              </span>
            </li>
          ) : (
            <li key={page}>
              <Button
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={`Go to page ${page}`}
                onClick={() => onPageChange(page)}
                size="icon"
                variant={page === currentPage ? "primary" : "ghost"}
              >
                {page}
              </Button>
            </li>
          )
        )}

        <li>
          <Button
            aria-label="Go to next page"
            className="gap-1.5"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            size="sm"
            variant="ghost"
          >
            Next
            <RiArrowRightSLine aria-hidden="true" size={16} />
          </Button>
        </li>
      </ul>
    </nav>
  )
}
