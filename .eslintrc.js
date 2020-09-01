module.exports = {
    env: {
        jest: true,
        node: true,
    },
    plugins: ['@typescript-eslint', 'prettier', 'import', 'prefer-arrow'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: '2017',
        sourceType: 'module',
        project: './tsconfig.eslint.json',
    },
    extends: [
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            node: {},
            typescript: {
                directory: './tsconfig.eslint.json',
            },
        },
        'import/internal-regex': 'aws\\-promise\\-jest\\-mock$',
    },
    ignorePatterns: ['*.d.ts', '*.generated.ts', '**/src/models.ts'],
    rules: {
        // Require use of the `import { foo } from 'bar';` form instead of `import foo = require('bar');`
        '@typescript-eslint/no-require-imports': ['error'],

        '@typescript-eslint/no-empty-function': ['warn'],

        // Require all imported dependencies are actually declared in package.json
        'import/no-extraneous-dependencies': ['error'],
        'import/no-unresolved': ['error'],
    },
};
