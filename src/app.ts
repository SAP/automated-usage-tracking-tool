import CliTracker from './cli/cliTracker'
import { ConsentType } from './common/consent'
import Tracker, { ConsentArguments, TrackUsageArguments, TrackerArguments } from './common/tracker'

async function main() {
  console.log('cli app called ')
  const trackerArguments: TrackerArguments = {
    apiKey: '4_TCuGT23_GS-FxSIFf3YNdQ',
    dataCenter: 'eu1',
    storageName: 'usageTracking',
  }
  const consentArguments: ConsentArguments = {
    requestType: ConsentType.QUESTION,
    email: 'example99@test.com',
  }
  const trackUsageArguments: TrackUsageArguments = {
    toolName: 'cdc-toolkit',
    featureName: 'copy-configuration-extended',
  }

  const tracker: Tracker = new CliTracker(trackerArguments)
  const consent: boolean = await tracker.requestConsent(consentArguments)
  if (!consent) {
    throw new Error('Program aborted because the consent was rejected')
  }
  tracker.trackUsage(trackUsageArguments)
}

main()
