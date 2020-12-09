module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageThreshold: {
        global: {
            branches: 20,
            statements: 20,
        },
    },
    collectCoverage: false,
    coverageProvider: 'v8',
    coverageReporters: ['json', 'lcov', 'text'],
    coveragePathIgnorePatterns: ['node_modules/', '__tests__/data/', 'src/models.ts'],
};
