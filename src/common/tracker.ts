import { ConsentType } from './consent'
import Storage from './storage'

export default interface Tracker {
  apiKey: string
  storage: Storage

  requestConsent(email: string, requestType: ConsentType, message?: string): Promise<boolean>
  trackUsage(toolName: string): void
}
