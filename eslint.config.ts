import withNuxt from './.nuxt/eslint.config.mjs'
import perfectionist from 'eslint-plugin-perfectionist'

const noSdkTsBarrel = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow importing from @injectivelabs/sdk-ts barrel export'
    },
    messages: {
      noBarrel:
        'Do not import from "@injectivelabs/sdk-ts". Use subpath imports like @injectivelabs/sdk-ts/client/indexer, /core/modules, etc.'
    }
  },
  create(context: any) {
    return {
      ImportDeclaration(node: any) {
        if (node.source.value === '@injectivelabs/sdk-ts') {
          // Allow type-only imports (import type { ... } from '@injectivelabs/sdk-ts')
          if (node.importKind === 'type') {
            return
          }

          context.report({ node, messageId: 'noBarrel' })
        }
      }
    }
  }
}

const sortGroups = {
  groups: [
    [
      'builtin',
      'internal',
      'external',
      'injective',
      'shared',
      'parent',
      'sibling',
      'index',
      'object'
    ],
    ['root', 'unknown'],
    'types',
    'type',
    'internal-type',
    ['parent-type', 'sibling-type', 'index-type']
  ] as string[] | { newlinesBetween: 'always' }[],

  customGroups: {
    value: {
      shared: '^@shared/',
      injective: '^@injectivelabs/',
      // note: injective-ui cannot use alias imports @
      types: ['^../types', '^../../types/', '^../../../types/'],
      root: [
        '^\\.\\./[^./][^/]*$', // (../file)
        '^(?:\\.\\./){2}[^./][^/]*$', // (../../file)
        '^(?:\\.\\./){3}[^./][^/]*$', // (../../../file)
        '^\\./\\.\\./[^./][^/]*$', // (./../file)
        '^\\./(?:\\.\\./){2}[^./][^/]*$', // (./../../file)
        '^\\./(?:\\.\\./){3}[^./][^/]*$' // (./../../../file)
      ]
    }
  }
}

const orderParams = {
  order: 'asc',
  type: 'line-length'
} as const

export default withNuxt(
  {
    ignores: ['i18n/locales/**', '*.cjs', '*.js']
  },
  {
    plugins: {
      perfectionist,
      'custom-rules': {
        rules: {
          'no-sdk-ts-barrel': noSdkTsBarrel
        }
      }
    },

    rules: {
      'custom-rules/no-sdk-ts-barrel': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' }
      ],

      'no-console': 'off',
      'vue/no-v-html': 'off',
      'no-unused-vars': 'off',
      'vue/html-self-closing': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',

      // Enforce type imports on separate lines
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: false
        }
      ],
      // Disabled: requires type information which causes memory issues
      '@typescript-eslint/consistent-type-exports': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      // Disable import/no-duplicates as it conflicts with separate type imports
      'import/no-duplicates': 'off',
      ...perfectionist.configs['recommended-line-length'].rules,

      'perfectionist/sort-enums': ['off', orderParams],
      'perfectionist/sort-objects': ['off', orderParams],
      'perfectionist/sort-modules': ['off', orderParams],
      'perfectionist/sort-exports': ['warn', orderParams],
      'perfectionist/sort-interfaces': ['warn', orderParams],
      'perfectionist/sort-union-types': ['warn', orderParams],
      'perfectionist/sort-object-types': ['warn', orderParams],
      'perfectionist/sort-named-exports': ['warn', orderParams],
      'perfectionist/sort-named-imports': ['warn', orderParams],
      'perfectionist/sort-array-includes': ['warn', orderParams],
      'perfectionist/sort-imports': [
        'warn',
        {
          ...orderParams,
          newlinesBetween: 'never',
          groups: sortGroups.groups,
          customGroups: sortGroups.customGroups
        }
      ]
    }
  }
)
