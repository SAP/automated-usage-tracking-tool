import Storage from './storage'
import Account from '../gigya/account'
import Consent from './consent'
import AOAClient, { createAOAClient } from '../aoa/aoaClient'

export default abstract class Tracker {
  apiKey: string
  dataCenter: string
  storage: Storage
  account: Account
  consent: Consent

  private aoaClient: AOAClient | null = null

  constructor(trackerArguments: TrackerArguments, storage: Storage, consent: Consent) {
    this.apiKey = trackerArguments.apiKey
    this.dataCenter = trackerArguments.dataCenter
    this.account = new Account(this.apiKey, this.dataCenter)
    this.storage = storage
    this.consent = consent
    this.aoaClient = createAOAClient(trackerArguments)
  }

  async requestConsentQuestion(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.requestConsent(this.consent.askConsentQuestion.bind(this.consent), consentArguments)
  }

  async requestConsentConfirmation(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.requestConsent(this.consent.askConsentConfirm.bind(this.consent), consentArguments)
  }

  public async provideConsentQuestionAnswer(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.requestConsent(this.consent.provideConsentQuestionAnswer.bind(this.consent), consentArguments)
  }

  public async provideConsentConfirmAnswer(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.requestConsent(this.consent.provideConsentConfirmAnswer.bind(this.consent), consentArguments)
  }

  async trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void> {
    if (this.storage.isConsentGranted()) {
      this.storage.setLatestUsage(trackUsageArguments.toolName, trackUsageArguments.featureName)
      await this.account.setLatestUsages(this.storage.getEmail(), this.storage.getLatestUsages())
    }

    if (this.aoaClient) {
      try {
        await this.aoaClient.trackUsage(trackUsageArguments.toolName)
      } catch (error) {
        console.error('[AOA] tracking failed:', error instanceof Error ? error.message : error)
      }
    }
  }

  private async requestConsent(consentFunction: ConsentFunction, consentArguments: ConsentArguments): Promise<boolean> {
    if (!this.storage.isConsentGranted()) {
      const consentResponse = await consentFunction(consentArguments.message)
      if (consentResponse) {
        const email = consentArguments.email ?? ''
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
  clientId?: string
  clientSecret?: string
  tokenUrl?: string
  apiUrl?: string
  proxyUrl?: string
}

export interface ConsentArguments {
  email?: string
  message?: string
}

export interface TrackUsageArguments {
  toolName: string
  featureName?: string
}
