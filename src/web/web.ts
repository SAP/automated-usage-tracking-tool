import WebTracker from './webTracker'
import { ConsentArguments, TrackUsageArguments, TrackerArguments } from '../common/tracker'

export default class Web {
  private tracker: WebTracker

  constructor(trackerArguments: TrackerArguments) {
    this.tracker = new WebTracker(trackerArguments)
  }

  async requestConsentQuestion(consentArguments: ConsentArguments = {}): Promise<boolean> {
    return await this.tracker.requestConsentQuestion(consentArguments)
  }

  async requestConsentConfirmation(consentArguments: ConsentArguments = {}): Promise<boolean> {
    return await this.tracker.requestConsentConfirmation(consentArguments)
  }

  async trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void> {
    return await this.tracker.trackUsage(trackUsageArguments)
  }

  isConsentGranted(): boolean {
    return this.tracker.storage.isConsentGranted()
  }
}
