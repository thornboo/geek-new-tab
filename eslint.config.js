import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  prettier,
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        localStorage: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        setTimeout: 'readonly'
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'vue/no-unused-vars': 'warn',
      // 格式相关规则，由 Prettier 处理
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off'
    }
  },
  {
    ignores: ['dist', 'node_modules', '*.config.js']
  }
]
