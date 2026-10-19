const config = require('./jest.config')

module.exports = {
  ...config,
  testMatch: ['**/*.test.ts', '**/src/infra/db/**/*.spec.ts']
}
