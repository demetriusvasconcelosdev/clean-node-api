const config = require('./jest.config')

module.exports = {
  ...config,
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/src/infra/db/']
}
