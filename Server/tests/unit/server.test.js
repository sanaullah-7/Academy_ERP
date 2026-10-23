import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import { startServer } from '../../src/server.js'
import { silentLogger, testConfig } from './testHelpers.js'

test('starts with injected isolated dependencies and shuts down cleanly', async () => {
  let connected = 0
  let disconnected = 0
  const database = {
    async connect(uri) {
      assert.equal(uri, testConfig.mongo.uri)
      connected += 1
    },
    async disconnect() { disconnected += 1 },
    getStatus: () => ({ ready: true, state: 'connected' }),
  }

  const result = await startServer({
    config: { ...testConfig, port: 0 },
    database,
    appLogger: silentLogger,
  })
  await once(result.server, 'listening')
  assert.equal(await result.databaseConnection, true)
  const response = await fetch(`http://127.0.0.1:${result.server.address().port}/api/v1/ready`)
  assert.equal(response.status, 200)
  await result.shutdown('TEST')
  assert.equal(connected, 1)
  assert.equal(disconnected, 1)
  assert.equal(result.server.listening, false)
})

test('keeps health available and readiness closed when MongoDB connection fails', async () => {
  const database = {
    async connect() { throw new Error('database host unavailable') },
    async disconnect() {},
    getStatus: () => ({ ready: false, state: 'disconnected' }),
  }
  const result = await startServer({
    config: { ...testConfig, port: 0 },
    database,
    appLogger: silentLogger,
  })
  await once(result.server, 'listening')
  assert.equal(await result.databaseConnection, false)
  const port = result.server.address().port
  const health = await fetch(`http://127.0.0.1:${port}/api/v1/health`)
  const ready = await fetch(`http://127.0.0.1:${port}/api/v1/ready`)
  assert.equal(health.status, 200)
  assert.equal(ready.status, 503)
  await result.shutdown('TEST')
})
