import AoaTracker from '../aoa/aoaTracker'

export default class CliAoaTracker extends AoaTracker {
  constructor() {
    super()
    this.init()
  }

  protected warnMissing(message: string): void {
    console.warn(`[AOA] ${message}`)
  }
}
