import { match, P } from "ts-pattern"

export type PageItem = number | "ellipsis"

export const getPageItems = (current: number, total: number): Array<PageItem> =>
  match(total)
    .with(P.number.lte(7), (t) => Array.from({ length: t }, (_, i) => i + 1))
    .otherwise(() => {
      const rangeStart = Math.max(2, current - 1)
      const rangeEnd = Math.min(total - 1, current + 1)

      const window: Array<PageItem> = Array.from(
        { length: rangeEnd - rangeStart + 1 },
        (_, i) => rangeStart + i
      )

      const leading = match(rangeStart > 2)
        .with(true, (): Array<PageItem> => ["ellipsis"])
        .with(false, (): Array<PageItem> => [])
        .exhaustive()

      const trailing = match(rangeEnd < total - 1)
        .with(true, (): Array<PageItem> => ["ellipsis"])
        .with(false, (): Array<PageItem> => [])
        .exhaustive()

      return [1, ...leading, ...window, ...trailing, total]
    })
