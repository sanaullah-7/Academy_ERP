import assert from 'node:assert/strict'
import { test } from 'node:test'
import { logger } from '../../src/config/logger.js'

test('redacts credential-bearing URIs and sensitive context keys', () => {
  const original = console.error
  let output = ''
  console.error = (value) => { output = value }
  try {
    logger.error('Connection failed for mongodb://user:pass@example.test/database', {
      token: 'private-token',
    })
  } finally {
    console.error = original
  }
  assert.doesNotMatch(output, /user:pass|private-token/)
  assert.match(output, /\[REDACTED\]/)
})
