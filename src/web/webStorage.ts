import Storage from '../common/storage'
import Usage from '../common/usage'

export default class WebStorage extends Storage {
  constructor(location: string) {
    super(location)
    this.#initStorage()
  }

  #initStorage(): void {
    this.#read()
  }

  #read() {
    const storedUsage = localStorage.getItem(this.location)
    if (storedUsage) {
      this.toStorage(atob(storedUsage))
    }
  }

  #write() {
    localStorage.setItem(this.location, btoa(this.toString()))
  }

  // TODO: we should refactor Storage because the 3 methods bellow are common, the methods that need concrete implementations
  // are initStorage, read and write, only those 3 should be abstract
  setConsentGranted(consent: boolean, email: string): void {
    this.consentGranted = consent
    this.email = email
    this.#write()
  }

  setLatestUsage(toolName: string, featureName?: string): void {
    this.#filterLatestUsages()
    const usage = new Usage(toolName, featureName)
    this.latestUsages.push(usage)
    this.#write()
  }

  #filterLatestUsages(): void {
    this.latestUsages = this.latestUsages.filter((usage) => {
      const THIRTY_MINUTES: number = 30 * 60 * 1000 // ms
      return Math.abs(new Date().getTime() - new Date(usage.createdAt).getTime()) < THIRTY_MINUTES
    })
  }
}
