import Usage, { UsageProperties } from './usage'

export default abstract class Storage {
  protected email: string
  protected consentGranted: boolean
  protected latestUsages: Usage[]
  protected location: string

  constructor(location: string) {
    this.location = location
    this.email = ''
    this.consentGranted = false
    this.latestUsages = []
  }

  isConsentGranted(): boolean {
    return this.consentGranted
  }

  toStorage(content: string) {
    if (content && content.length > 0) {
      const jsonObj = JSON.parse(content)
      this.consentGranted = jsonObj.consentGranted
      this.email = jsonObj.email
      this.latestUsages = []
      jsonObj.latestUsages.map((u: UsageProperties) => {
        this.latestUsages.push(Usage.toUsage(u))
      })
    }
    return this
  }

  toString() {
    return JSON.stringify({
      location: this.location,
      consentGranted: this.consentGranted,
      email: this.email,
      latestUsages: this.latestUsages,
    })
  }

  getLatestUsages(): Usage[] {
    return this.latestUsages
  }

  getEmail(): string {
    return this.email
  }

  abstract setConsentGranted(consent: boolean, email: string): void

  abstract setLatestUsage(toolName: string, featureName?: string): void
}
