import CliTracker from './cliTracker'
import { ConsentArguments, TrackUsageArguments, TrackerArguments } from '../common/tracker'

export default class Cli {
  private tracker: CliTracker

  constructor(trackerArguments?: TrackerArguments) {
    this.tracker = new CliTracker(trackerArguments)
  }

  /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
  async requestConsentQuestion(consentArguments: ConsentArguments = {}): Promise<boolean> {
    return await this.tracker.requestConsentQuestion(consentArguments)
  }

  /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
  async requestConsentConfirmation(consentArguments: ConsentArguments = {}): Promise<boolean> {
    return await this.tracker.requestConsentConfirmation(consentArguments)
  }

  /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
  async provideConsentQuestionAnswer(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.tracker.provideConsentQuestionAnswer(consentArguments)
  }

  /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
  async provideConsentConfirmAnswer(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.tracker.provideConsentConfirmAnswer(consentArguments)
  }

  async trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void> {
    return await this.tracker.trackUsage(trackUsageArguments)
  }

  async trackUsages(trackUsageArguments: TrackUsageArguments[]): Promise<void> {
    return await this.tracker.trackUsages(trackUsageArguments)
  }

  /** @deprecated Consent is always granted with AOA. Always returns true. */
  isConsentGranted(): boolean {
    return this.tracker.isConsentGranted()
  }
}
