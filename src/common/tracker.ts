import { ConsentType } from './consent'
import Storage from './storage'

export default interface Tracker {
  apiKey: string
  storage: Storage

  requestConsent(consentArguments: ConsentArguments): Promise<boolean>
  trackUsage(trackUsageArguments: TrackUsageArguments): void
}

export interface TrackerArguments {
  apiKey: string
  dataCenter: string
  storageName?: string
}

export interface ConsentArguments {
  requestType?: ConsentType
  email?: string
  message?: string
}

export interface TrackUsageArguments {
  toolName: string
  featureName?: string
}
