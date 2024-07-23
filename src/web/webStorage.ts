import Storage from '../common/storage'
import Usage from '../common/usage'

export default class WebStorage extends Storage {
  constructor(location: string) {
    super(location)
    this.#initStorage()
  }

  #initStorage(): void {
    this.read()
  }

  read(): Storage {
    let storedUsage = localStorage.getItem(this.location)
    if (null === storedUsage || undefined === storedUsage) {
      return this
    }
    return this.toStorage(atob(storedUsage))
  }

  write() {
    localStorage.setItem(this.location, btoa(this.toString()))
  }
}
