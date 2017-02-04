/**
 * Expose the compiled database in json format and implement basic functionality
 * such as filtering and searching
 *
 * Providers are only used to compile the database. The search and filering
 * functionality are the only functionalities that execute at runtime. This
 * design aimed to help optimize performance.
 *
 * @flow
 */

/* eslint fp/no-throw: 0 */

import APICatalogProvider from './api-catalog/APICatalogProvider';
import type { RecordType } from './ProviderType';


export default APICatalogProvider;

export function find(id: string): RecordType {
  const foundRecord = APICatalogProvider().find(record => record.id === id);

  if (foundRecord) return foundRecord;

  throw new Error(`API by id of '${id}' cannot be found`);
}


// @TODO
// export function filterByProtoChain(chain: Array<string>): RecordType {}

export function ofAPIType(type: 'css' | 'js' | 'html'): Array<RecordType> {
  return APICatalogProvider()
    .filter(record =>
      record.type === `${type}-api` ||
      record.type === String(type)
    );
}
