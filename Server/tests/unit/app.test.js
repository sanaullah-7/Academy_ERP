import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Router } from 'express'
import { createApp } from '../../src/app.js'
import { databaseStub, silentLogger, testConfig, withServer } from './testHelpers.js'

test('creates an Express application with safe defaults', () => {
  const app = createApp({ config: testConfig, database: databaseStub(), logger: silentLogger })
  assert.equal(typeof app, 'function')
  assert.equal(app.get('x-powered-by'), false)
})

test('health is available without database readiness', async () => {
  const app = createApp({ config: testConfig, database: databaseStub(), logger: silentLogger })
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/health`)
    const body = await response.json()
    assert.equal(response.status, 200)
    assert.equal(body.status, 'ok')
    assert.equal(body.data.service, 'tsa-academy-api')
    assert.match(response.headers.get('x-request-id'), /^[0-9a-f-]{36}$/)
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
    assert.equal(response.headers.get('x-powered-by'), null)
  })
})

test('readiness reports an unavailable database without querying it', async () => {
  const app = createApp({ config: testConfig, database: databaseStub(), logger: silentLogger })
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/ready`)
    assert.equal(response.status, 503)
    assert.deepEqual(await response.json(), {
      status: 'unavailable',
      data: { database: 'disconnected' },
    })
  })
})

test('returns a correlated JSON 404', async () => {
  const app = createApp({ config: testConfig, database: databaseStub(), logger: silentLogger })
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/missing`)
    const body = await response.json()
    assert.equal(response.status, 404)
    assert.equal(body.error.code, 'ROUTE_NOT_FOUND')
    assert.equal(body.error.requestId, response.headers.get('x-request-id'))
  })
})

test('returns a safe invalid JSON error', async () => {
  const app = createApp({ config: testConfig, database: databaseStub(), logger: silentLogger })
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/health`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{bad json',
    })
    const body = await response.json()
    assert.equal(response.status, 400)
    assert.equal(body.error.code, 'INVALID_JSON')
    assert.equal(body.error.message, 'Request body contains invalid JSON.')
  })
})

test('returns a safe body limit error', async () => {
  const app = createApp({ config: { ...testConfig, jsonBodyLimit: '10b' }, database: databaseStub(), logger: silentLogger })
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/health`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ value: 'larger than ten bytes' }),
    })
    const body = await response.json()
    assert.equal(response.status, 413)
    assert.equal(body.error.code, 'BODY_TOO_LARGE')
  })
})

test('does not expose unexpected error details', async () => {
  const testRoutes = Router()
  testRoutes.get('/explode', () => {
    throw new Error('private database detail')
  })
  const app = createApp({ config: testConfig, database: databaseStub(), logger: silentLogger, testRoutes })
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/__test__/explode`)
    const raw = await response.text()
    assert.equal(response.status, 500)
    assert.doesNotMatch(raw, /private database detail/)
    assert.equal(JSON.parse(raw).error.code, 'INTERNAL_ERROR')
  })
})
