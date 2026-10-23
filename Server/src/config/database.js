import mongoose from 'mongoose'

const STATE_LABELS = Object.freeze({
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
})

export function createDatabaseManager({ mongooseInstance = mongoose, options = {} } = {}) {
  let connectPromise = null

  function getStatus() {
    const readyState = mongooseInstance.connection.readyState
    return Object.freeze({
      state: STATE_LABELS[readyState] || 'unknown',
      ready: readyState === 1,
    })
  }

  async function connect(uri) {
    if (getStatus().ready) return getStatus()
    if (connectPromise) return connectPromise

    connectPromise = mongooseInstance
      .connect(uri, options)
      .then(() => getStatus())
      .finally(() => {
        connectPromise = null
      })
    return connectPromise
  }

  async function disconnect() {
    if (mongooseInstance.connection.readyState === 0) return
    await mongooseInstance.disconnect()
  }

  return Object.freeze({ connect, disconnect, getStatus })
}

export function databaseOptions(config) {
  return {
    minPoolSize: config.mongo.minPoolSize,
    maxPoolSize: config.mongo.maxPoolSize,
    serverSelectionTimeoutMS: config.mongo.serverSelectionTimeoutMS,
    connectTimeoutMS: config.mongo.connectTimeoutMS,
    socketTimeoutMS: config.mongo.socketTimeoutMS,
    autoIndex: false,
  }
}
