import { once } from 'node:events'

export const testConfig = Object.freeze({
  nodeEnv: 'test',
  isProduction: false,
  port: 5000,
  trustProxy: false,
  jsonBodyLimit: '10kb',
  mongo: Object.freeze({
    uri: 'mongodb://127.0.0.1:27017/tsa_academy_test',
    minPoolSize: 0,
    maxPoolSize: 2,
    serverSelectionTimeoutMS: 100,
    connectTimeoutMS: 100,
    socketTimeoutMS: 1000,
  }),
})

export const silentLogger = Object.freeze({ info() {}, error() {} })

export function databaseStub({ ready = false, state = ready ? 'connected' : 'disconnected' } = {}) {
  return Object.freeze({
    getStatus: () => Object.freeze({ ready, state }),
    async connect() {},
    async disconnect() {},
  })
}

export async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const { port } = server.address()
  try {
    await run(`http://127.0.0.1:${port}`)
  } finally {
    server.close()
    await once(server, 'close')
  }
}
