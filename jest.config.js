module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/setup.js'],
    coverageThreshold: {
        global: {
            branches: 20,
            statements: 20,
        },
    },
    collectCoverage: true,
    coverageReporters: ['json', 'lcov', 'text'],
    coveragePathIgnorePatterns: ['node_modules/', '__tests__/data/', 'src/models.ts'],
};
