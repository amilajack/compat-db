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
          | 'tag'
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
