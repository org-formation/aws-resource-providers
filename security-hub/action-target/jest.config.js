/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const base = require('../../jest.config.base.js');
const package = require('./package');

module.exports = {
    ...base,
    displayName: package.name,
    name: package.name,
};
