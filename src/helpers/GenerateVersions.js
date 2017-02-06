// @flow
/* eslint no-mixed-operators: 0, max-len: ['error', 120] */
import { browserNameToCaniuseMappings, fixedBrowserVersions } from './Constants';
import type { schemaType } from '../../src/database/TmpDatabase';


type targetType = {
  browserName: string,
  version: string,
  platform: string
};
type capabilityType = {
  browserName: string,
  minVersion: number,
  maxVersion: number
};
export function getCapabilities(object: capabilityType): Array<targetType> {
  const numberOfVersions = object.maxVersion - object.minVersion + 1;
  return Array(numberOfVersions).fill({}).map((each, i) => ({
    browserName: object.browserName,
    platform: 'Windows 10',
    version: `${i + object.minVersion}.0`
  }));
}

export const allTargets: Array<targetType> = [
  // Chrome: 30 versions
  ...getCapabilities({
    browserName: 'chrome',
    minVersion: 26,
    maxVersion: 55
  }),
  // Firefox: 47 versions
  ...getCapabilities({
    browserName: 'firefox',
    minVersion: 4,
    maxVersion: 50
  }),
  ...fixedBrowserVersions
];

/**
 * Return a sorted list of all the versions of a given caniuseId
 * ex. 'safari' => ['6.0', '7.0', ...etc]
 */
export function getAllVersionsOfTarget(caniuseId: string): Array<string> {
  return allTargets
    .filter(target =>
      browserNameToCaniuseMappings[target.browserName] === caniuseId
    )
    .map(target => String(target.version))
    // $FlowFixMe: Requires type cast
    .sort((a, b) => a - b); // eslint-disable-line
}

type versionsToMarkType = {
  left: Array<string>,
  right: Array<string>
};
/**
 * Given the a list of the marked versions, find versions that haven't been marked
 * yet and find the 'povit'. If middle is supported, mark 'right' elements as supported.
 * Otherwise, mark 'left' as unsupported.
 */
export function getVersionsToMark(markedVersions: Array<schemaType>, caniuseId: string): versionsToMarkType {
  const markedVersionsSet = new Set(markedVersions);
  const allVersionsSet = getAllVersionsOfTarget(caniuseId);
  const versionsToMark = allVersionsSet
    .filter(e => !markedVersionsSet.has(e))
    // $FlowFixMe: Requires type cast
    .sort((a, b) => a - b); // eslint-disable-line

  const middle = Math.floor(versionsToMark.length / 2);
  const left = versionsToMark.slice(0, middle);
  const right = versionsToMark.slice(middle, allVersionsSet.length);

  return {
    left,
    right,
    middle: versionsToMark[middle]
  };
}
