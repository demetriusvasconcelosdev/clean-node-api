const { MongoMemoryServer } = require('mongodb-memory-server')

module.exports = async () => {
  const mongod = await MongoMemoryServer.create()
  process.env.MONGO_URL = mongod.getUri()
  globalThis.__MONGOD__ = mongod
}
