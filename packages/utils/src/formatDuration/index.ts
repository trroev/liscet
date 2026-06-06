import { match } from "ts-pattern"

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60

  return match({ hours, remaining })
    .with({ hours: 0 }, () => `${minutes} min`)
    .with({ remaining: 0 }, ({ hours: h }) => `${h} hr`)
    .otherwise(({ hours: h, remaining: r }) => `${h} hr ${r} min`)
}
