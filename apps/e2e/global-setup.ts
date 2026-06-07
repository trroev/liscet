import { getOrInitTestEnv } from "./src/fixtures/test-env"

const globalSetup = (): void => {
  getOrInitTestEnv()
}

export default globalSetup
