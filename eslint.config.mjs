import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import parser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        'eslint.config.mjs',
        '**/*.js', '!src/main/resources/static/js/**/*.js'
    ]
}, {
    files: ['**/*.ts'],
    languageOptions: {
        parser,
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
}, ...compat.extends('xo', 'prettier'), {
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

        'prettier/prettier': ['error', {
            printWidth: 80,
            singleQuote: true,
            tabWidth: 4,
            trailingComma: 'none'
        }]
    }
}];
