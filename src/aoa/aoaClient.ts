import { getTool } from './toolRegistry'

export const AOA_DEFAULT_TOKEN_URL = 'https://sapit-crossfunctions-prod-ragdoll.authentication.eu10.hana.ondemand.com/oauth/token'
export const AOA_DEFAULT_API_URL = 'https://asc-auto-ops-tracking-api-prod.cfapps.eu10-004.hana.ondemand.com'

export interface AOAConfig {
  clientId: string
  clientSecret: string
  tokenUrl: string
  apiUrl: string
}

export interface TrackingReport {
  toolId: string
  customerName: string
  customerId: string
  receiverCostObject: string
  receiverRegion: string
  executor: string
  executorCostCenter?: string
  numberOfExecutions: number
  actualEffortReduction: number
  date: string
}

export interface AOAErrorResponse {
  errorMessage: string
  detailedErrors?: string[][]
}

export default class AOAClient {
  private accessToken: string = ''
  private tokenExpiresAt: number = 0

  constructor(private config: AOAConfig) {}

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        response_type: 'token',
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to obtain access token: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as { access_token: string; expires_in: number }
    this.accessToken = data.access_token
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000
    return this.accessToken
  }

  async sendTrackingReport(reports: TrackingReport[]): Promise<void> {
    const token = await this.getAccessToken()

    const response = await fetch(`${this.config.apiUrl}/api/automations/tracking-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reports),
    })

    if (response.status === 201) {
      return
    }

    const errorBody: AOAErrorResponse = (await response.json().catch(() => ({ errorMessage: response.statusText }))) as AOAErrorResponse
    throw new Error(
      `AOA tracking error (${response.status}): ${errorBody.errorMessage}${errorBody.detailedErrors ? ' - ' + JSON.stringify(errorBody.detailedErrors) : ''}`,
    )
  }

  async trackUsage(toolName: string, featureName?: string): Promise<void> {
    const report = buildReport(toolName, featureName)
    await this.sendTrackingReport([report])
  }


}

// --- Report building ---

const AOA_FIXED_FIELDS = {
  customerName: 'MULTIPLE',
  customerId: 'MULTIPLE',
  receiverCostObject: 'MULTIPLE',
  receiverRegion: 'MULTIPLE',
  executor: 'MULTIPLE',
  executorCostCenter: '144496124',
}

function buildReport(toolName: string, featureName?: string): TrackingReport {
  const tool = getTool(featureName, toolName)
  if (!tool) {
    throw new Error(`Tool not found in registry: ${featureName ? `featureName=${featureName}, ` : ''}toolName=${toolName}`)
  }
  return {
    toolId: tool.toolId,
    numberOfExecutions: 1,
    actualEffortReduction: tool.actualEffortReduction,
    date: new Date().toISOString().split('T')[0],
    ...AOA_FIXED_FIELDS,
  }
}
