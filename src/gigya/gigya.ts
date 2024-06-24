type Params = Record<string, string>

interface Response {
  code?: string
  errorCode?: number
  errorMessage?: string
  [key: string]: any
}

export interface GigyaResponse {
  callId: string
  errorCode: number
  apiVersion: number
  statusCode: number
  statusReason: string
  time: number
  code?: string
  errorDetails?: string
  errorMessage?: string
  dataCenter?: string
  regToken?: string
}

class Gigya {
  private static readonly RETRYABLE_ERRORS = ['ERR_BAD_RESPONSE', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'ERR_SOCKET_CONNECTION_TIMEOUT']
  private static readonly RETRYABLE_ERROR_CODES = [403048, 500001]
  private static readonly MAX_RETRY_COUNT = 15

  private static instance: Gigya

  private constructor() {}

  static getInstance(): Gigya {
    if (!this.instance) {
      this.instance = new Gigya()
    }
    return this.instance
  }

  private async post(url: string, body: Params): Promise<GigyaResponse> {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    }

    const response: Response = await fetch(url, requestOptions)
    return await response.json()
  }

  async request(url: string, params: Params, retryCount = 0): Promise<GigyaResponse> {
    const body = { ...params }
    try {
      const response = await this.post(url, body)

      if (this.shouldRetry(response, retryCount)) {
        console.log(`${response.code || response.errorMessage}... Trying again...`)
        await this.delay(5000)
        return await this.request(url, params, retryCount + 1)
      }

      return response
    } catch (error) {
      if (retryCount < Gigya.MAX_RETRY_COUNT) {
        console.log(`${error}... Trying again...`)
        return await this.request(url, params, retryCount + 1)
      }
      throw error
    }
  }

  private shouldRetry(response: GigyaResponse, retryCount: number): boolean {
    return (
      ((response.code !== undefined && Gigya.RETRYABLE_ERRORS.includes(response.code)) ||
        (response.errorCode !== undefined && Gigya.RETRYABLE_ERROR_CODES.includes(response.errorCode))) &&
      retryCount < Gigya.MAX_RETRY_COUNT
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export default Gigya
