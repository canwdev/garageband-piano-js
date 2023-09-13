module.exports = {
  root: true,
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    'plugin:vue/vue3-strongly-recommended',
    "plugin:vue/vue3-essential",
    'plugin:prettier/recommended',
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "parser": "@typescript-eslint/parser",
    "sourceType": "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  "plugins": [
    "vue",
    "@typescript-eslint"
  ],
  "rules": {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-async-promise-executor': 'warn',
    '@typescript-eslint/no-var-requires': 'off',
    'vue/v-on-event-hyphenation': 'off',
    'vue/no-mutating-props': 'off',
    'vue/no-unused-components': 'warn',
    'vue/no-setup-props-destructure': 'warn',
    '@typescript-eslint/no-empty-interface': 'warn',
    'vue/component-tags-order': [
      'error',
      {
        // order: [['script', 'template'], 'style'],
        order: ['script', 'template', 'style'],
      },
    ],
  }
}
