import { Skeleton } from "@repo/ui/components/Skeleton"

export default function DashboardLoading() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </section>
  )
}
