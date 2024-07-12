import Storage from '../common/storage'
import Tracker, { ConsentArguments, TrackUsageArguments, TrackerArguments } from '../common/tracker'
import Account from '../gigya/account'
import WebConsent from './webConsent'
import WebStorage from './webStorage'

export default class WebTracker implements Tracker {
  apiKey: string
  dataCenter: string
  storage: Storage
  account: Account
  consent: WebConsent

  constructor(trackerArguments: TrackerArguments) {
    this.apiKey = trackerArguments.apiKey
    this.dataCenter = trackerArguments.dataCenter
    this.storage = new WebStorage(trackerArguments.storageName ? trackerArguments.storageName : 'usageTracking')
    this.account = new Account(this.apiKey, this.dataCenter)
    this.consent = new WebConsent()
  }

  // TODO: the two methods bellow are similar to the ones in CliTracker,
  // the only diference is the Consent implementation, shouldn't we inject the dependency?
  async requestConsentQuestion(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.requestConsent(this.consent.askConsentQuestion.bind(this.consent), consentArguments)
  }

  async requestConsentConfirmation(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.requestConsent(this.consent.askConsentConfirm.bind(this.consent), consentArguments)
  }

  // TODO: this is duplicated, must refactor
  async trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void> {
    if (this.storage.isConsentGranted()) {
      this.storage.setLatestUsage(trackUsageArguments.toolName, trackUsageArguments.featureName)
      await this.account.setLatestUsages(this.storage.getEmail(), this.storage.getLatestUsages())
    }
  }

  // TODO: this is duplicated, must refactor
  private async requestConsent(consentFunction: ConsentFunction, consentArguments: ConsentArguments): Promise<boolean> {
    if (!this.storage.isConsentGranted()) {
      const consent = await consentFunction(consentArguments.message)
      if (consent) {
        const email: string = consentArguments.email ? consentArguments.email : crypto.randomUUID() + '@automated-usage-tracking-tool.sap'
        this.storage.setConsentGranted(consent, email)
        await this.account.setConsent(consent, email)
      }
      return consent
    }
    return true
  }
}

// TODO: this is duplicated, must refactor
type ConsentFunction = (message?: string) => Promise<boolean>
