/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const base = require('./jest.config.base.js');

module.exports = {
    ...base,
    setupFiles: ['<rootDir>/setup.js'],
    // testRunner: 'jest-circus/runner',
    projects: ['<rootDir>/**/jest.config.js'],
    coverageDirectory: '<rootDir>/coverage/',
};
