import CliTracker from './cli/cliTracker'
import { ConsentArguments, TrackUsageArguments, TrackerArguments } from './common/tracker'

export module api {
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

  export function trackUsage(trackUsageArguments: TrackUsageArguments): void {
    tracker.trackUsage(trackUsageArguments)
  }
}

export default api
