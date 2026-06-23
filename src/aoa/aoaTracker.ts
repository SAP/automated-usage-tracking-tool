import AOAClient, { createAOAClient } from './aoaClient'

const AOA_MISSING_MESSAGE =
  'AOA tracking is not configured. Please provide AOA_CLIENT_ID and AOA_CLIENT_SECRET to enable AOA tracking.'

export default abstract class AoaTracker {
  private client: AOAClient | null

  constructor() {
    this.client = createAOAClient()
  }

  protected abstract warnMissing(message: string): void

  init(): void {
    if (!this.client) {
      this.warnMissing(AOA_MISSING_MESSAGE)
    }
  }

  async trackUsage(toolName: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.trackUsage(toolName)
      } catch (error) {
        console.error('[AOA] tracking failed:', error instanceof Error ? error.message : error)
      }
    }
  }
}
