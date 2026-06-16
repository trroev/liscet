const categoryShortfallSubject = (): string =>
  "Some required CE categories are still short"

const humanizeCategory = (category: string): string => {
  const spaced = category.replace(/-/g, " ")
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const pluralizeHours = (hours: number): string =>
  hours === 1 ? "1 hour" : `${hours} hours`

export { categoryShortfallSubject, humanizeCategory, pluralizeHours }
