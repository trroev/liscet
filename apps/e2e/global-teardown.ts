import { DB_DRIVERS } from "@repo/env/database"
import { MongoClient } from "mongodb"
import { Client } from "pg"
import { TEST_ENV_KEYS } from "./src/fixtures/test-env"

const dropMongoDatabase = async ({
  uri,
  dbName,
}: {
  readonly uri: string
  readonly dbName: string
}): Promise<void> => {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    await client.db(dbName).dropDatabase()
  } finally {
    await client.close()
  }
}

const dropPostgresDatabase = async ({
  adminUri,
  dbName,
}: {
  readonly adminUri: string
  readonly dbName: string
}): Promise<void> => {
  const client = new Client({ connectionString: adminUri })
  await client.connect()
  try {
    // A failed run may never have created the db; nothing to drop then.
    const existing = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    )
    if (existing.rowCount === 0) {
      return
    }
    // Revoke new connections first so the still-running web server (whose
    // Postgres adapter reconnects when its connection drops) cannot re-attach
    // between the terminate and the drop — otherwise DROP DATABASE blocks
    // indefinitely. The db name is a SQL identifier, so it can't be a bound
    // parameter; it is harness-generated (no user input), so interpolation is
    // safe. Then terminate the existing sessions and force-drop.
    await client.query(
      `ALTER DATABASE "${dbName}" WITH ALLOW_CONNECTIONS false`
    )
    await client.query(
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()",
      [dbName]
    )
    await client.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`)
  } finally {
    await client.end()
  }
}

const globalTeardown = async (): Promise<void> => {
  const driver = process.env[TEST_ENV_KEYS.driver]
  const dbName = process.env[TEST_ENV_KEYS.dbName]
  const dbUri = process.env[TEST_ENV_KEYS.dbUri]
  if (!(driver && dbName && dbUri)) {
    return
  }

  if (driver === DB_DRIVERS.postgres) {
    const adminUri = process.env[TEST_ENV_KEYS.adminUri]
    if (!adminUri) {
      return
    }
    await dropPostgresDatabase({ adminUri, dbName })
    return
  }

  await dropMongoDatabase({ uri: dbUri, dbName })
}

export default globalTeardown
