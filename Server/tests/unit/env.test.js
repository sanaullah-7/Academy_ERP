import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createConfig } from '../../src/config/env.js'

const valid = Object.freeze({
  NODE_ENV: 'test',
  PORT: '5050',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/tsa_academy_test',
})

test('validates and normalizes backend configuration', () => {
  const config = createConfig(valid)
  assert.equal(config.nodeEnv, 'test')
  assert.equal(config.port, 5050)
  assert.equal(config.mongo.maxPoolSize, 10)
  assert.equal(config.jsonBodyLimit, '100kb')
  assert.equal(config.trustProxy, false)
})

test('fails safely without a MongoDB URI', () => {
  assert.throws(() => createConfig({ NODE_ENV: 'test' }), /MONGODB_URI is required/)
})

test('rejects invalid ports and pool bounds', () => {
  assert.throws(() => createConfig({ ...valid, PORT: '70000' }), /PORT must be an integer/)
  assert.throws(
    () => createConfig({ ...valid, MONGODB_MIN_POOL_SIZE: '20', MONGODB_MAX_POOL_SIZE: '10' }),
    /cannot exceed/,
  )
})

test('rejects unsupported trust proxy and body-limit values', () => {
  assert.throws(() => createConfig({ ...valid, TRUST_PROXY: 'loopback' }), /TRUST_PROXY/)
  assert.throws(() => createConfig({ ...valid, JSON_BODY_LIMIT: 'large' }), /JSON_BODY_LIMIT/)
})
