import type { JSX } from "react"
import { JsonLd } from "react-schemaorg"
import type { Thing, WithContext } from "schema-dts"

export type StructuredDataProps<T extends Thing> = {
  item: WithContext<T>
}

export function StructuredData<T extends Thing>({
  item,
}: StructuredDataProps<T>): JSX.Element {
  return <JsonLd<T> item={item} />
}
