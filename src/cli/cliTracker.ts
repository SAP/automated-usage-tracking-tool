import { ConsentType } from '../common/consent'
import Storage from '../common/storage'
import Tracker, { ConsentArguments, TrackUsageArguments, TrackerArguments } from '../common/tracker'
import Account from '../gigya/account'
import { CliConsent } from './cliConsent'
import FileStorage from './fileStorage'

export default class CliTracker implements Tracker {
  apiKey: string
  dataCenter: string
  storage: Storage
  account: Account

  constructor(trackerArguments: TrackerArguments) {
    this.apiKey = trackerArguments.apiKey
    this.dataCenter = trackerArguments.dataCenter
    this.storage = new FileStorage(trackerArguments.storageName ? trackerArguments.storageName : 'usageTracking')
    this.account = new Account(this.apiKey, this.dataCenter)
  }

  async requestConsent(consentArguments: ConsentArguments): Promise<boolean> {
    const cliConsent: CliConsent = new CliConsent()
    if (!this.storage.isConsentGranted()) {
      const consent =
        consentArguments.requestType === ConsentType.QUESTION
          ? await cliConsent.askConsentQuestion(consentArguments.message)
          : await cliConsent.askConsentConfirm(consentArguments.message)
      if (consent) {
        const email: string = consentArguments.email ? consentArguments.email : crypto.randomUUID() + '@usageTrackingTool.com'
        this.storage.setConsentGranted(consent, email)
        await this.account.setConsent(consent, email)
      }
      return consent
    }
    return true
  }

  async trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void> {
    console.log(`trackUsage called for tool ${trackUsageArguments.toolName}`)
    if (this.storage.isConsentGranted()) {
      this.storage.setLatestUsage(trackUsageArguments.toolName, trackUsageArguments.featureName)
      await this.account.setLatestUsages(this.storage.getEmail(), this.storage.getLatestUsages())
    }
  }
}
