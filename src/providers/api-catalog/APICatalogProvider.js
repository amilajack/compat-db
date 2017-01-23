// @flow
import APICatalog from './apicatalogdata.json';
import type { ProviderAPIResponse } from '../ProviderType';


type APICatalogType = Array<{
  name: string,
  spec: bool,
  specNames: Array<string>,
  apis: Array<{
    name: string,
    specNames: Array<string>
  }>
}>;

/**
 * Comvert camelcase phrases to hypen-separated words
 * ex. camelCase => camel-case
 * This is used to map CSS DOM API names to css properties and attributes
 */
export function camelToHyphen(string: string): string {
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
export default function APICatalogProvider(): Array<ProviderAPIResponse> {
  const formattedRecords = [];

  // Convert two dimentional records to single dimentional array
  (APICatalog: APICatalogType)
    .forEach(record => record.apis.forEach(api => formattedRecords.push({
      ...api,
      spec: record.spec || false,
      parentName: record.name
    })));

  const JSAPIs = formattedRecords
    // Filter all CSS records. For some reason reason, APICatalog does not report
    // the correctly. Validate that the record's name is a string. Some record
    // names are numbers from some odd reason
    .filter(fRecord =>
      !fRecord.name.includes('-') &&
      fRecord.parentName !== ('CSS2Properties') &&
      Number.isNaN(parseInt(fRecord.name, 10)) &&
      typeof fRecord.spec !== 'undefined'
    )
    .map(fRecord => ({
      id: fRecord.name,
      name: fRecord.name,
      specNames: fRecord.specNames,
      type: 'js-api',
      specIsFinished: fRecord.spec,
      protoChain: ['window', fRecord.parentName, fRecord.name]
    }));

  // Find the CSS DOM API's and use them create the css style records
  const CSSAPIs = JSAPIs
    .filter(record => record.protoChain.includes('CSSStyleDeclaration'))
    .map(record => ({
      ...record,
      id: camelToHyphen(record.name),
      name: camelToHyphen(record.name),
      type: 'css-api'
    }));

  return CSSAPIs.concat(JSAPIs);
  // return [...CSSAPIs, ...JSAPIs];
}
