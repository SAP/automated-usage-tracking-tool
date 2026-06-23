import AoaTracker from '../aoa/aoaTracker'
import { AOAConfig, AOA_DEFAULT_TOKEN_URL, AOA_DEFAULT_API_URL } from '../aoa/aoaClient'

export default class CliAoaTracker extends AoaTracker {
  constructor() {
    super()
    this.init()
  }

  protected resolveConfig(): AOAConfig | null {
    const clientId = process.env.AOA_CLIENT_ID ?? ''
    const clientSecret = process.env.AOA_CLIENT_SECRET ?? ''

    if (!clientId || !clientSecret) return null

    const tokenUrl = process.env.AOA_TOKEN_URL ?? AOA_DEFAULT_TOKEN_URL
    const apiUrl = process.env.AOA_API_URL ?? AOA_DEFAULT_API_URL

    return { clientId, clientSecret, tokenUrl, apiUrl }
  }

  protected warnMissing(message: string): void {
    console.warn(`[AOA] ${message}`)
  }
}
