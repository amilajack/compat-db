// @flow
export type ProviderAPIResponse = {
  /**
   * The human readable name of the API. This will be used for error reporting
   */
  name: string,

  /**
   * The official name of the specification
   */
  specNames: Array<string>,

  /**
   * Determine if the spec has finished being written
   */
  specIsFinished: bool,

  /**
   * Prototype chain/method list
   *
   * ex. ['window']              <= default
   *
   * ex. ['document']            <= This is an example of `querySelector`'s
   *                                protoChain
   *
   * ex. ['Array', 'prototype']  <= This is an example what the protoChain of
   *                                `push` would look like
   */
  protoChain: Array<string>,

  /**
   * The method or object to typecheck
   * ex. fetch, ServiceWorker, navigator.serviceWorker
   * Will be typechecked like so: typeof fetch !== 'undefined'
   */
  apiValueCheck: string,

  /**
   * Categorize the api as a css style or a javascript api. For example,
   * `display` and `block` would have `css-api` as the `type`. Array.prototype.includes
   * will have `js-api` as `type`
   *
   * Usually, if `apiValueCheck` is camelcase, is js-api. Else, is css-api. If
   * cannot be determined, (ex. block) then create two responses with different
   * `type`'s
   */
  type: 'js-api' | 'css-api',

  /**
   * The data type of the api
   */
  apiType: Array<'global' | 'object' | 'function' | 'property' | 'method'>
          | 'declaration'
          | 'property'
};

export type ProviderAPIResponses = Array<ProviderAPIResponse>;
