module.exports = {
    root: true,
    parser: "vue-eslint-parser",
    parserOptions: {
        ecmaVersion: 2020
    },
    plugins: [
        "@typescript-eslint"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:vue/vue3-essential",
        "@vue/typescript/recommended",
    ],
    env: {
        node: true,
    },
    overrides: [
        {
          files: [
              "**/tests/**/*.test.{j,t}s"
          ],
          env: {
            jest: true,
          },
        },
    ],
    rules: {
        'vue/multi-word-component-names': 'off',
        'no-prototype-builtins': 'off',
        "@typescript-eslint/no-explicit-any": "off",
        // TODO: enable this again and fix occurances of non-null assert
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }
        ]
    },
};
