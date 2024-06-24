import { ConsentType } from '../common/consent'
import Storage from '../common/storage'
import Tracker, { ConsentArguments, TrackUsageArguments, TrackerArguments } from '../common/tracker'
import { CliConsent } from './cliConsent'
import FileStorage from './fileStorage'

export default class CliTracker implements Tracker {
  apiKey: string
  dataCenter: string
  storage: Storage

  constructor(trackerArguments: TrackerArguments) {
    this.apiKey = trackerArguments.apiKey
    this.dataCenter = trackerArguments.dataCenter
    this.storage = new FileStorage(trackerArguments.storageName ? trackerArguments.storageName : 'usageTracking')
  }

  async requestConsent(consentArguments: ConsentArguments): Promise<boolean> {
    const cliConsent: CliConsent = new CliConsent()
    if (!this.storage.isConsentGranted()) {
      const consent =
        consentArguments.requestType === ConsentType.QUESTION
          ? await cliConsent.askConsentQuestion(consentArguments.message)
          : await cliConsent.askConsentConfirm(consentArguments.message)
      if (consent) {
        this.storage.setConsentGranted(consent, consentArguments.email ? consentArguments.email : crypto.randomUUID() + '@usageTrackingTool.com')
      }
      return consent
    }
    return true
  }

  trackUsage(trackUsageArguments: TrackUsageArguments): void {
    console.log(`trackUsage called for tool ${trackUsageArguments.toolName}`)
    if (this.storage.isConsentGranted()) {
      this.storage.setLatestUsage(trackUsageArguments.toolName)
    }
  }
}
