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
    if (content?.length > 0) {
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

  protected abstract initStorage(): void
  protected abstract read(): Storage
  protected abstract write(): void

  setConsentGranted(consent: boolean, email: string): void {
    this.consentGranted = consent
    this.email = email
    this.write()
  }

  setLatestUsage(toolName: string, featureName?: string): void {
    this.filterLatestUsages()
    const usage = new Usage(toolName, featureName)
    this.latestUsages.push(usage)
    this.write()
  }

  protected filterLatestUsages(): void {
    this.latestUsages = this.latestUsages.filter((usage) => {
      const THIRTY_MINUTES: number = 30 * 60 * 1000 // ms
      return Math.abs(new Date().getTime() - new Date(usage.createdAt).getTime()) < THIRTY_MINUTES
    })
  }
}
