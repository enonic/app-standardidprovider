import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import xo from 'eslint-config-xo';
import parser from "@typescript-eslint/parser";

export default [{
    ignores: [
        'eslint.config.mjs',
        'build/**',
        '**/*.js', '!src/main/resources/static/js/**/*.js'
    ]
}, ...xo({ browser: true, space: 4, prettier: 'compat' }), {
    files: ['**/*.ts'],
    languageOptions: {
        parser,
        parserOptions: {
            projectService: {
                allowDefaultProject: ['vite.config.ts']
            }
        },
        globals: {
            ...globals.browser,
            ...globals.node,
            app: false,
            CONFIG: false,
            resolve: false
        },

        sourceType: "module",
        ecmaVersion: "latest"
    }
}, {
    plugins: {
        prettier
    },
    rules: {
        'comma-dangle': ['error', 'never'],
        'no-underscore-dangle': ['off'],
        'func-names': ['off'],

        'no-plusplus': ['error', {
            allowForLoopAfterthoughts: true
        }],

        'vars-on-top': 'off',
        'global-require': 'off',

        'no-use-before-define': ['error', {
            functions: false
        }],

        'linebreak-style': ['off'],
        'import-x/no-absolute-path': 'off',
        'import-x/order': 'off',
        'n/file-extension-in-import': 'off',
        'n/prefer-global/process': 'off',
        'require-unicode-regexp': 'off',
        'unicorn/name-replacements': 'off',
        '@typescript-eslint/array-type': 'off',
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-restricted-types': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/switch-exhaustiveness-check': 'off',
        '@eslint-community/eslint-comments/require-description': 'off',
        'preserve-caught-error': 'off',
        'regexp/prefer-lookaround': 'off',
        'regexp/prefer-named-capture-group': 'off',
        'unicorn/catch-error-name': 'off',
        'unicorn/consistent-boolean-name': 'off',
        'unicorn/prefer-string-raw': 'off',
        'unicorn/prefer-string-replace-all': 'off',
        'unicorn/prefer-string-slice': 'off',
        'unicorn/prefer-ternary': 'off',
        'unicorn/switch-case-braces': 'off',

        'prettier/prettier': ['error', {
            printWidth: 80,
            singleQuote: true,
            tabWidth: 4,
            trailingComma: 'none'
        }]
    }
}];
