import Consent, { ConsentType } from '../common/consent'
import Storage from '../common/storage'
import Tracker from '../common/tracker'
import { CliConsent } from './cliConsent'
import FileStorage from './fileStorage'

export default class CliTracker implements Tracker {
  apiKey: string
  storage: Storage

  constructor(apiKey: string, storageName: string) {
    this.apiKey = apiKey
    this.storage = new FileStorage(storageName)
  }

  async requestConsent(requestType: ConsentType, email: string = crypto.randomUUID() + '@usageTrackingTool.com', message: string = Consent.message): Promise<boolean> {
    const cliConsent: CliConsent = new CliConsent()
    if (!this.storage.isConsentGranted()) {
      const consent = requestType === ConsentType.CONFIRMATION ? await cliConsent.askConsentConfirm() : await cliConsent.askConsentQuestion()
      console.log(`consent=${consent}`)
      if (consent) {
        this.storage.setConsentGranted(consent, email)
      }
      return consent
    }
    return true
  }

  trackUsage(toolName: string): void {
    console.log(`trackUsage called for tool ${toolName}`)
    if (this.storage.isConsentGranted()) {
      this.storage.setLatestUsage(toolName)
    }
  }
}
