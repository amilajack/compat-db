// @flow
import MicrosoftAPICatalog from './microsoft-api-catalog-data.json';
import HasPrefix from '../../helpers/HasPrefix';
import type { RecordType } from '../RecordType';


type MicrosoftAPICatalogProviderType = Array<{
  name: string,
  spec: bool,
  specNames: Array<string>,
  apis: Array<{
    name: string,
    specNames: Array<string>
  }>
}>;

/**
 * Map webidl definition names to prototype chain parent
 * ex. Console -> console
 *
 * This helps generate protoChain's and protoChainId's
 * ex. Console.log -> console.log
 */
export function interceptAndFormat(parentObjectId: string): string {
  const APIsToLowercase = new Set([
    'Console', 'Window', 'Document', 'External', 'History', 'Location', 'Navigator', 'Performance',
    'Screen', 'defaultStatus', 'Controllers'
  ]);

  return APIsToLowercase.has(parentObjectId)
    ? parentObjectId.toLowerCase()
    : parentObjectId;
}

/**
 * Comvert camelcase phrases to hypen-separated words
 * ex. camelCase => camel-case
 * This is used to map CSS DOM API names to css properties and attributes
 */
export function camelCaseToHyphen(string: string): string {
  return Array
    // Covert string to array
    .from(string)
    // If char `X` is uppercase, map it to `-x`
    .map(curr => (
      curr === curr.toUpperCase()
        ? `-${curr.toLowerCase()}`
        : curr
    ), [])
    .join('');
}

/**
 * @TODO: Allow overriding database records
 */
export default function MicrosoftAPICatalogProvider(): Array<RecordType> {
  const formattedRecords = [];
  const ignoredAPIs = ['arguments', 'caller', 'constructor', 'length', 'name', 'prototype'];

  // Convert two dimentional records to single dimentional array
  (MicrosoftAPICatalog: MicrosoftAPICatalogProviderType)
    .forEach(record => {
      formattedRecords.push({
        ...record,
        parentName: record.name,
        protoChain: [interceptAndFormat(record.name)],
        protoChainId: interceptAndFormat(record.name),
        spec: record.spec || false,
        webidlId: record.name
      });

      record.apis.forEach(api =>
        // @TODO: Properly strip vendor prefixes and check if non-prefixed API
        //        exists. If not, create the record for it
        formattedRecords.push({
          ...api,
          spec: record.spec || false,
          parentName: record.name
        })
      );
    });

  const JSAPIs = formattedRecords
    // Filter all CSS records. For some reason reason, MicrosoftAPICatalog does not report
    // the correctly. Validate that the record's name is a string. Some record
    // names are numbers from some odd reason
    .filter(fRecord =>
      !fRecord.name.includes('-') &&
      fRecord.parentName !== 'CSS2Properties' &&
      Number.isNaN(parseInt(fRecord.name, 10)) &&
      typeof fRecord.spec !== 'undefined'
    )
    .map(fRecord => ({
      id: fRecord.name,
      name: fRecord.name,
      specNames: fRecord.specNames,
      type: 'js-api',
      specIsFinished: fRecord.spec,
      protoChain: fRecord.protoChain || [interceptAndFormat(fRecord.parentName), fRecord.name]
    }))
    // Remove 'window' from the protochain
    .map(record => ({
      ...record,
      protoChain: record.protoChain.filter(e => e !== 'window'),
      protoChainId: record.protoChain.filter(e => e !== 'window').join('.')
    }))
    .filter(record => (
      record.name !== 'defaultStatus' &&
      record.protoChain.length !== 0 &&
      !ignoredAPIs.includes(record.name) &&
      !HasPrefix(record.name) &&
      !HasPrefix(record.protoChainId) &&
      !HasPrefix(record.id)
    ));

  // Find the CSS DOM API's and use them create the css style records
  const CSSAPIs = JSAPIs
    .filter(record => record.protoChain.includes('CSSStyleDeclaration'))
    .map(record => ({
      ...record,
      id: camelCaseToHyphen(record.name),
      name: camelCaseToHyphen(record.name),
      type: 'css-api'
    }));

  return [...CSSAPIs, ...JSAPIs];
}
