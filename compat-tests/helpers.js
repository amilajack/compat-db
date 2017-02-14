export async function filterJobs(capability: browserCapabilityType, job: JobQueueType) {
  const { caniuseId, version } = job;
  const record: RecordType = JSON.parse(job.record);

  const existingRecordTargetVersions =
    await findSameVersionCompatRecord(record, caniuseId);

  // If we have records for the current browser version, the tests are done
  const recordAlreadyExists = existingRecordTargetVersions
    ? Object
        .keys(existingRecordTargetVersions.versions)
        .find(target => (target === String(version)))
    : false;

  return recordAlreadyExists;
}

export function log(browserName, version, platform, record: Object, isSupported: bool) {
  const shouldLogCompatSpecResults =
    process.env.LOG_COMPAT_SPEC_RESULTS
      ? process.env.LOG_COMPAT_SPEC_RESULTS === 'true'
      : true;

  if (shouldLogCompatSpecResults) {
    console.log([
      `"${record.protoChainId}" ${isSupported ? 'IS ✅ ' : 'is NOT ❌ '}`,
      `API supported in ${browserName} ${version} on ${platform}`
    ].join(' '));
  }
}
