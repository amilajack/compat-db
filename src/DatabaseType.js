/**
 * This is the typing for compat-db
 * @flow
 */
import type { ProviderAPIResponse } from './providers/ProviderType';


type DBCompatRecord = ProviderAPIResponse
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
          // Undetermined API type
          | null
}
| {
  /**
   * The type of ESLint AST node. These are only required for JS API's
   * ex. fetch('google.com') => 'CallExpression'
   * ex. navigator.serviceWorker() => 'MemberExpression'
   * ex. new PaymentRequest() => 'NewExpression'
   */
  ASTNodeTypes: Array<'MemberExpression' | 'NewExpression' | 'CallExpression'>
});

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
        [version: string]: 'y' | 'n' | 'prefixed'
      }
    }
    & DBCompatRecord
    & ? {
      // Lists of hyphen-separated CSS properties and values
      allCSSProperties: Array<string>,
      allCSSValues: Array<string>
    }
  }>
};
