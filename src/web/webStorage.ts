import Storage from '../common/storage'
import Usage from '../common/usage'

export default class WebStorage extends Storage {
  constructor(location: string) {
    super(location)
    this.initStorage()
  }

  protected initStorage(): void {
    this.read()
  }

  protected read(): Storage {
    const storedUsage = localStorage.getItem(this.location)
    if (null === storedUsage || undefined === storedUsage) {
      return this
    }
    return this.toStorage(atob(storedUsage))
  }

  protected write() {
    localStorage.setItem(this.location, btoa(this.toString()))
  }
}
