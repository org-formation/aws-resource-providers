/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const base = require('./jest.config.base.js');

module.exports = {
    ...base,
    setupFiles: ['<rootDir>/setup.js'],
    projects: ['<rootDir>/**/jest.config.js'],
    coverageDirectory: '<rootDir>/coverage/',
};
