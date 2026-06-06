import path from "node:path"
import { fileURLToPath } from "node:url"
import { createPayloadConfig } from "@repo/payload/payload-config"

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default createPayloadConfig({ baseDir: path.resolve(dirname) })
