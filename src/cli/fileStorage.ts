/// <reference path="../../node_modules/@types/node/fs.d.ts" />
import Storage from '../common/storage'
import fs from 'fs'

export default class FileStorage extends Storage {
  constructor(location: string) {
    super(location)
    this.initStorage()
  }

  protected initStorage(): void {
    fs.openSync(this.location, 'a+')
    this.read()
  }

  protected read(): Storage {
    const content: Buffer = fs.readFileSync(this.location)
    if (null === content || undefined === content) {
      return this
    }
    return this.toStorage(atob(content.toString()))
  }

  protected write(): void {
    fs.writeFileSync(this.location, btoa(this.toString()))
  }
}
