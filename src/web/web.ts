import WebTracker from './webTracker'
import { ConsentArguments, TrackUsageArguments, TrackerArguments } from '../common/tracker'

export module webApi {
  let tracker: WebTracker

  export function init(trackerArguments: TrackerArguments) {
    tracker = new WebTracker(trackerArguments)
  }
  export async function requestConsentQuestion(consentArguments: ConsentArguments, message: string): Promise<boolean> {
    return await tracker.requestConsentQuestion(consentArguments)
  }

  export async function requestConsentConfirmation(consentArguments: ConsentArguments, message: string): Promise<boolean> {
    return await tracker.requestConsentConfirmation(consentArguments)
  }

  export function trackUsage(trackUsageArguments: TrackUsageArguments): void {
    tracker.trackUsage(trackUsageArguments)
  }
}

export default webApi
