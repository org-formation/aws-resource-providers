module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageThreshold: {
        global: {
            branches: 50,
            statements: 60,
        },
    },
    collectCoverage: true,
    coverageReporters: ['json', 'lcov', 'text'],
    coveragePathIgnorePatterns: ['node_modules/', '__tests__/data/', 'src/models.ts'],
};
