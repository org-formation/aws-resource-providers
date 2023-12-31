module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/test/**/*.test.ts'],
    coverageReporters: ['text', 'cobertura'],
    collectCoverageFrom: ['**/*.ts', '!node_modules/**', '!build/**', '!test/**'],
    reporters: ['default', 'jest-junit'],
    verbose: true,
    testTimeout: 300000,
};
