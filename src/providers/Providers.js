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

import MicrosoftAPICatalogProvider from './microsoft-api-catalog/MicrosoftAPICatalogProvider';
import type { RecordType } from './RecordType';

export default MicrosoftAPICatalogProvider;

export function find(id: string): RecordType {
  const foundRecord = MicrosoftAPICatalogProvider().find(
    record => record.id === id
  );

  if (foundRecord) return foundRecord;

  throw new Error(`API by id of '${id}' cannot be found`);
}

// @TODO
// export function filterByProtoChain(chain: Array<string>): RecordType {}

export function ofAPIType(type: 'css' | 'js' | 'html'): Array<RecordType> {
  return MicrosoftAPICatalogProvider().filter(
    record => record.type === `${type}-api`
  );
}
