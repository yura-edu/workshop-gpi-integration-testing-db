import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/repositories/**/*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'json-summary', 'lcov'],
  testTimeout: 30000,
  setupFiles: ['<rootDir>/tests/setup.ts'],
}

export default config
