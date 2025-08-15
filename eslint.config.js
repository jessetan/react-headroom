import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
// import promisePlugin from 'eslint-plugin-promise'
// import nPlugin from 'eslint-plugin-n'
import babelParser from '@babel/eslint-parser'

export default [
  // Base ESLint recommended rules
  js.configs.recommended,
  
  // Configuration for all files
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
          plugins: ['@babel/plugin-transform-class-properties']
        },
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'writable',
        require: 'readonly',
        setTimeout: 'readonly',
        requestAnimationFrame: 'readonly'
      }
    },
    
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin
    },
    
    settings: {
      react: {
        version: 'detect'
      }
    },
    
    rules: {
      // Core ESLint rules (standard-style)
      'indent': ['error', 2, { SwitchCase: 1 }],
      'semi': ['error', 'never'],
      'no-extra-semi': 'error',
      'space-before-function-paren': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'never'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      'space-in-parens': ['error', 'never'],
      'space-before-blocks': 'error',
      'keyword-spacing': 'error',
      
      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/no-string-refs': 'off',
      'react/prop-types': 'off',
      'react/jsx-filename-extension': 'off',
      'react/destructuring-assignment': 'off',
      'react/jsx-props-no-spreading': 'off',
      
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Import rules
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      
      // Core Node/Browser compatibility
      'no-undef': 'error',
      'no-unused-vars': 'warn'
    }
  },
  
  // Ignore patterns (replaces .eslintignore)
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js',
      'demo/build/**'
    ]
  }
]