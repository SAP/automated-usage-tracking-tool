import CliTracker from './cliTracker'
import { ConsentArguments, TrackUsageArguments, TrackerArguments } from '../common/tracker'

export module cliApi {
  let tracker: CliTracker

  export function init(trackerArguments: TrackerArguments) {
    tracker = new CliTracker(trackerArguments)
  }
  export async function requestConsentQuestion(consentArguments: ConsentArguments): Promise<boolean> {
    return await tracker.requestConsentQuestion(consentArguments)
  }

  export async function requestConsentConfirmation(consentArguments: ConsentArguments): Promise<boolean> {
    return await tracker.requestConsentConfirmation(consentArguments)
  }

  export async function trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void> {
    return await tracker.trackUsage(trackUsageArguments)
  }

  export function isConsentGranted(): boolean {
    return tracker.storage.isConsentGranted()
  }
}

export default cliApi
