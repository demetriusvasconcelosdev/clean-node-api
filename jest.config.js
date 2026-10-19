module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/index.ts'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest-setup-env.js'],
  globalSetup: '<rootDir>/jest-mongodb-setup.js',
  globalTeardown: '<rootDir>/jest-mongodb-teardown.js',
  transform: { '.+\\.ts$': 'ts-jest' },
  moduleNameMapper: {
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
