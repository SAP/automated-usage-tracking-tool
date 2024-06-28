import Storage from './storage'

export default interface Tracker {
  apiKey: string
  storage: Storage

  requestConsentQuestion(consentArguments: ConsentArguments): Promise<boolean>
  requestConsentConfirmation(consentArguments: ConsentArguments): Promise<boolean>
  trackUsage(trackUsageArguments: TrackUsageArguments): void
}

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
