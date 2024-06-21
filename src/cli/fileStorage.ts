/// <reference path="../../node_modules/@types/node/fs.d.ts" />
import Storage from '../common/storage'
import fs from 'fs'
import Usage from '../common/usage'

export default class FileStorage extends Storage {
  constructor(location: string) {
    super(location)
    this.#initStorage()
  }

  #initStorage(): void {
    fs.openSync(this.location, 'a+')
    this.#read()
  }

  #read(): Storage {
    const content: Buffer = fs.readFileSync(this.location)
    return this.toStorage(content.toString())
  }

  #write(): void {
    fs.writeFileSync(this.location, this.toString())
  }

  setConsentGranted(consent: boolean, email: string): void {
    this.consentGranted = consent
    this.email = email
    this.#write()
  }

  setLatestUsage(toolName: string): void {
    this.#filterLatestUsages()
    const usage = new Usage(toolName)
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
