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

import APICatalogProvider from './api-catalog/APICatalogProvider';
import type { ProviderAPIResponse } from './ProviderType';

export default APICatalogProvider;

export function find(id: string): ProviderAPIResponse {
  const foundRecord = APICatalogProvider().find(record => record.id === id);

  if (foundRecord) return foundRecord;

  throw new Error(`API by id of '${id}' cannot be found`);
}

export function ofAPIType(type: string): Array<ProviderAPIResponse> {
  return APICatalogProvider().filter(record => record.type === type);
}
