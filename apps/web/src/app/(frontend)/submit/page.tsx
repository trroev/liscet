import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Submit a post",
}

export default function SubmitPage() {
  return (
    <section className="constrainer flex flex-col space-y-6 py-10">
      <h1 className="font-display text-heading-xl text-text-primary">
        Submit a post
      </h1>
      <p className="text-body text-text-secondary">
        This route is a stub. Implement a submission form (e.g. with TanStack
        Form) that posts to a server action which creates a draft via the
        Payload Local API. See the{" "}
        <Link className="underline" href="/admin">
          admin panel
        </Link>{" "}
        for now.
      </p>
    </section>
  )
}
