import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDatabaseManager, databaseOptions } from '../../src/config/database.js'
import { testConfig } from './testHelpers.js'

test('reports database state without issuing a health query', () => {
  const fakeMongoose = {
    connection: { readyState: 0 },
    async connect() {},
    async disconnect() {},
  }
  const manager = createDatabaseManager({ mongooseInstance: fakeMongoose })
  assert.deepEqual(manager.getStatus(), { state: 'disconnected', ready: false })
  fakeMongoose.connection.readyState = 1
  assert.deepEqual(manager.getStatus(), { state: 'connected', ready: true })
})

test('uses bounded MongoDB pool and timeout defaults', () => {
  assert.deepEqual(databaseOptions(testConfig), {
    minPoolSize: 0,
    maxPoolSize: 2,
    serverSelectionTimeoutMS: 100,
    connectTimeoutMS: 100,
    socketTimeoutMS: 1000,
    autoIndex: false,
  })
})

test('deduplicates concurrent connection attempts', async () => {
  let connections = 0
  let release
  const fakeMongoose = {
    connection: { readyState: 0 },
    connect: async () => {
      connections += 1
      await new Promise((resolve) => { release = resolve })
      fakeMongoose.connection.readyState = 1
    },
    async disconnect() {},
  }
  const manager = createDatabaseManager({ mongooseInstance: fakeMongoose })
  const first = manager.connect('mongodb://example.test/database')
  const second = manager.connect('mongodb://example.test/database')
  assert.equal(connections, 1)
  release()
  await Promise.all([first, second])
  assert.equal(manager.getStatus().ready, true)
})
