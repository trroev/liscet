const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

export const formatLongDate = (date: Date): string =>
  longDateFormatter.format(date)
