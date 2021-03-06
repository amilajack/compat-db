/**
 * Providers are responsible for parsing sources of information and returning
 * a formatted list of information, as described below. It does not
 * actually run the tests which determine browser API compatibility.
 *
 * @flow
 */
export type RecordType = {
  /**
   * The human readable name of the API. This will be used for error reporting
   */
  name: string,

  /**
   * The unique id that is used to search for the property
   */
  id: string,

  /**
   * The name of the WebIDL definition file
   */
  webidlId: string,

  /**
   * An object containing information about the spec. This information is not
   * relevant to the compatibility of the spec it self. It may describe what the
   * API does
   */
  meta?: {
    /**
     * An optional description of the API
     */
    desc: string,

    /**
     * Future possible metadata fields
     */
    [property: string]: any
  },

  /**
   * The official name of the specification
   * @TODO
   */
  specNames?: Array<string>,

  /**
   * Determine if the spec has finished being written
   * @TODO
   */
  specIsFinished?: boolean,

  /**
   * Prototype chain/method list
   *
   * ex. ['document', 'querySelector']  <= Ex. of `querySelector`'s protoChain
   *
   * ex. ['Array', 'prototype', 'push']   <= Example of `push` protoChain
   */
  protoChain: Array<string>,

  /**
   * A stringified protoChain
   * ex. ['fetch'] => 'fetch'
   */
  protoChainId: string,

  /**
   * Categorize the api as a css style or a javascript api. For example,
   * `display` and `block` would have `css-api` as the `type`. Array.prototype.includes
   * will have `js-api` as `type`
   *
   * Usually, if `apiValueCheck` is camelcase, is js-api. Else, is css-api. If
   * cannot be determined, (ex. block) then create two responses with different
   * `type`'s
   */
  type: 'js-api' | 'css-api' | 'html-api'
};
