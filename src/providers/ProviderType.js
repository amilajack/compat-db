// @flow
export type ProviderAPIResponse = {
  specName: string,
  id: string,

  /**
   * The method or object to typecheck
   * ex. fetch, ServiceWorker, navigator.serviceWorker
   */
  typeCheck: string,

  /**
   * The type of api
   * @type {String}
   */
  type: 'js-api' | 'css-api',
};
