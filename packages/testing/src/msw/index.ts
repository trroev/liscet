import { setupServer } from "msw/node"

export const server = setupServer()

export { HttpResponse, http } from "msw"
export * from "./handlers"
