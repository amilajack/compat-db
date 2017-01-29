/**
 * This is the typing for compat-db
 * @flow
 */
import type { ProviderAPIResponse } from './providers/ProviderType';


type DBCompatRecord = ProviderAPIResponse & {
  /**
   * The data type of the api
   */
  apiType: Array<'global' | 'object' | 'function' | 'property' | 'method'>
          // css-api specific
          | 'declaration'
          | 'property'
          // html-api specific
          | 'attr'
          | 'value'
          | 'tag',

  /**
   * The type of ESLint AST node. These are only required for JS API's
   * ex. fetch('google.com') => 'CallExpression'
   * ex. navigator.serviceWorker() => 'MemberExpression'
   * ex. new PaymentRequest() => 'NewExpression'
   */
  ASTNodeTypes: Array<'MemberExpression' | 'NewExpression' | 'CallExpression'> | false
};

export type Database = {
  // The same 'agents' property from caniuse
  agents: {
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
  records: Array<{
    targets: {
      [target: string]: {
        [version: string]: string
      }
    },
    records: DBCompatRecord
  }>
};
