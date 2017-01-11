// @flow
type ProviderAPIResponse = {
  /**
   * The official name of the specification
   */
  specNames: Array<string>,

  /**
   * Determine if the spec has finished being written
   */
  specFinished: bool,

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
   * The data type of the api
   */
  apiType: Array<'global' | 'object' | 'function' | 'property' | 'method'>,

  /**
   * Categorize the api as a css property
   */
  type: 'js-api' | 'css-api'
};

export type ProviderAPIResponses = Array<ProviderAPIResponse>
