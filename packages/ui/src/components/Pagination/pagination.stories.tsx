import { preview } from "@repo/storybook-config/preview"
import { useState } from "react"
import { action } from "storybook/actions"

import { Pagination as Component } from "./pagination"

const meta = preview.meta({
  args: {
    currentPage: 3,
    totalPages: 10,
    onPageChange: action("onPageChange"),
  },
  component: Component,
  parameters: { layout: "centered" },
  title: "Molecules/Pagination",
})

export const Default = meta.story({})

const Interactive = ({ totalPages }: { totalPages: number }) => {
  const [page, setPage] = useState(1)
  return (
    <Component
      currentPage={page}
      onPageChange={setPage}
      totalPages={totalPages}
    />
  )
}

export const Showcase = meta.story({
  render: () => (
    <div className="flex flex-col gap-6">
      <Interactive totalPages={3} />
      <Interactive totalPages={10} />
      <Interactive totalPages={50} />
    </div>
  ),
})
