/**
 * This is the typing for compat-db
 * @flow
 */
import type { ProviderAPIResponse } from './providers/ProviderType';


// ex. targets: { chrome: { '50': 'y' } }
type Record = {
  targets: {
    [name: string]: {
      [version: string]: string
    }
  }
  & ProviderAPIResponse
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
  records: Array<Record>
};
