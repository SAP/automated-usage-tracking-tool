import Storage from './storage'
import Account from '../gigya/account'
import Consent from './consent'

export default abstract class Tracker {
  apiKey: string
  dataCenter: string
  storage: Storage
  account: Account
  consent: Consent

  constructor(trackerArguments: TrackerArguments, storage: Storage, consent: Consent) {
    this.apiKey = trackerArguments.apiKey
    this.dataCenter = trackerArguments.dataCenter
    this.account = new Account(this.apiKey, this.dataCenter)
    this.storage = storage
    this.consent = consent
  }

  async requestConsentQuestion(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.requestConsent(this.consent.askConsentQuestion.bind(this.consent), consentArguments)
  }

  async requestConsentConfirmation(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.requestConsent(this.consent.askConsentConfirm.bind(this.consent), consentArguments)
  }

  async trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void> {
    if (this.storage.isConsentGranted()) {
      this.storage.setLatestUsage(trackUsageArguments.toolName, trackUsageArguments.featureName)
      await this.account.setLatestUsages(this.storage.getEmail(), this.storage.getLatestUsages())
    }
  }

  private async requestConsent(consentFunction: ConsentFunction, consentArguments: ConsentArguments): Promise<boolean> {
    if (!this.storage.isConsentGranted()) {
      const consentResponse = await consentFunction(consentArguments.message)
      if (consentResponse) {
        const email: string = consentArguments.email ? consentArguments.email : crypto.randomUUID() + '@automated-usage-tracking-tool.sap'
        this.storage.setConsentGranted(consentResponse, email)
        await this.account.setConsent(consentResponse, email)
      }
      return consentResponse
    }
    return true
  }
}

type ConsentFunction = (message?: string) => Promise<boolean>

export interface TrackerArguments {
  apiKey: string
  dataCenter: string
  storageName?: string
}

export interface ConsentArguments {
  email?: string
  message?: string
}

export interface TrackUsageArguments {
  toolName: string
  featureName?: string
}
