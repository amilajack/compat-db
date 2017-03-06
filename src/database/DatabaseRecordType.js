/**
 * This is the typing for compat-db
 * @flow
 */
import type { RecordType } from '../providers/RecordType';


export type DatabaseRecordType = {
  // The same 'agents' property from caniuse
  agents?: {
    [name: string]: {
      browser: string,
      abbr: string,
      prefix: string,
      type: string,
      usage_global: {
        [version: string]: number
      }
    }
  },
  meta?: {
    // A list of all the camelcase CSS properties and values found in all browsers
    allCSSProperties: Array<string>,
    allCSSValues: Array<string>,
    // A list of all the camelcase CSS properties and values found in each browsers
    browsers: {
      [name: string]: {
        [version: string]: {
          allCSSProperties: Array<string>,
          allCSSValues: Array<string>
        }
      }
    }
  },
  records: Array<{
    targets: {
      [name: string]: {
        [version: string]: 'y' | 'n' | 'prefixed'
      }
    }
    & RecordType
    & ({
      /**
       * The data type of the api. This is specific to only CSS and HTML API's. JS
       * API's should have `false` for this property. `null` will be used for API's
       * whose types cannot be determined
       */
      apiType: 'value'
              | 'property'
              // html-api specific
              | 'attr'
              | 'value'
              | 'tag'
    }
    | {
      /**
       * The type of ESLint AST node. These are only required for JS API's
       * ex. fetch('google.com') => 'CallExpression'
       * ex. navigator.serviceWorker() => 'MemberExpression'
       * ex. new PaymentRequest() => 'NewExpression'
       */
      ASTNodeTypes: Array<'MemberExpression' | 'NewExpression' | 'CallExpression'>
    })
  }>
};
