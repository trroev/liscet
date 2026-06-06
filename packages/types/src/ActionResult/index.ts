export type ActionResult<TData = void> =
  | { status: "success"; data: TData }
  | { status: "error"; message: string; code?: string }
