module.exports = {
    extends: ['xo', 'prettier'],
    plugins: ['prettier'],
    rules: {
        'comma-dangle': ['error', 'never'],
        'no-underscore-dangle': ['off'],
        'func-names': ['off'],
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'vars-on-top': 'off',
        'global-require': 'off',
        'no-use-before-define': ['error', { functions: false }],
        'linebreak-style': ['off'],
        'prettier/prettier': [
            'error',
            {
                printWidth: 80,
                singleQuote: true,
                tabWidth: 4,
                trailingComma: 'none'
            }
        ]
    },
    env: {
        browser: true,
        node: true,
        es6: true
    },
    parserOptions: {
        ecmaVersion: 2019
    },
    globals: {
        app: false,
        CONFIG: false,
        resolve: false
    },
    ignorePatterns: [
        '**/*.js', '!src/main/resources/static/js/**/*.js'
    ]
};
