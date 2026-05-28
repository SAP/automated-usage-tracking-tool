import Usage from '../common/usage'
import Gigya, { GigyaRequestError, GigyaResponse, GigyaRetryOptions } from './gigya'

interface Params {
  apiKey: string
  [key: string]: any
}

const TOKEN_REFRESH_RETRIES = 1

export default class Account {
  token: string
  accountEndpointBaseUrl: string
  private queue: Promise<void> = Promise.resolve()

  constructor(
    private apiKey: string,
    private dataCenter: string,
    private retryOptions?: GigyaRetryOptions,
  ) {
    this.apiKey = apiKey
    this.dataCenter = dataCenter
    this.token = ''
    this.accountEndpointBaseUrl = this.getAccountBaseUrl()
  }

  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn)
    this.queue = run.then(() => {}, () => {})
    return run
  }

  private getAccountBaseUrl(): string {
    const protocol = 'https'
    const namespace = 'accounts'
    const domain = 'gigya.com'
    return `${protocol}://${namespace}.${this.dataCenter}.${domain}/${namespace}.`
  }

  private buildAccountEndpoint(endpoint: string): string {
    return `${this.accountEndpointBaseUrl}${endpoint}`
  }

  private formatGigyaError(prefix: string, endpoint: string, error: unknown): Error {
    if (error instanceof GigyaRequestError) {
      const details = [
        `step=${error.step}`,
        `endpoint=${endpoint}`,
        `attempt=${error.attempt}`,
        `kind=${error.kind}`,
        `statusCode=${error.statusCode ?? 'n/a'}`,
        `errorCode=${error.errorCode ?? 'n/a'}`,
        `errorMessage=${error.errorMessage ?? 'n/a'}`,
      ].join(', ')
      return new Error(`${prefix}. ${details}`)
    }
    const fallbackMessage = error instanceof Error ? error.message : String(error)
    return new Error(`${prefix}. endpoint=${endpoint}, errorMessage=${fallbackMessage}`)
  }

  async getToken(): Promise<string> {
    const body: Params = {
      apiKey: this.apiKey,
      isLite: true,
    }
    const endpoint = 'initRegistration'
    const endpointUrl = this.buildAccountEndpoint(endpoint)

    const startedAt = Date.now()
    console.info(`[CDC] step=token endpoint=${endpoint} start`)

    let response: GigyaResponse
    try {
      response = await Gigya.getInstance().request(endpointUrl, body, {
        step: 'token',
        endpoint,
        retryOptions: this.retryOptions,
      })
      const elapsedMs = Date.now() - startedAt
      const status = response.errorCode === 0 ? 'success' : 'api-error'
      console.info(`[CDC] step=token endpoint=${endpoint} ${status} elapsedMs=${elapsedMs} statusCode=${response.statusCode ?? 'n/a'} errorCode=${response.errorCode ?? 'n/a'}`)
    } catch (error) {
      console.error(`[CDC] step=token endpoint=${endpoint} failure elapsedMs=${Date.now() - startedAt}`)
      throw this.formatGigyaError('Error getting token', endpoint, error)
    }

    if (response.errorCode !== 0 || !response.regToken) {
      const details = response.errorDetails ? response.errorDetails : response.errorMessage
      return Promise.reject(new Error(`Error getting token. endpoint=${endpoint}, errorCode=${response.errorCode}, errorMessage=${details}`))
    }
    this.token = response.regToken
    return response.regToken
  }

  async setConsent(consent: boolean, email: string): Promise<GigyaResponse> {
    return this.enqueue(() => this.doSetConsent(consent, email))
  }

  private async doSetConsent(consent: boolean, email: string): Promise<GigyaResponse> {
    if (!this.token.length) {
      this.token = await this.getToken()
    }

    const body: Params = {
      apiKey: this.apiKey,
      regToken: this.token,
    }
    body.profile = JSON.stringify({ email: email })
    body.preferences = JSON.stringify({
      terms: {
        anonymousUsageAnalytics: {
          isConsentGranted: consent,
        },
      },
    })

    const endpoint = 'setAccountInfo'
    const endpointUrl = this.buildAccountEndpoint(endpoint)

    for (let refreshAttempt = 0; refreshAttempt <= TOKEN_REFRESH_RETRIES; refreshAttempt += 1) {
      const startedAt = Date.now()
      console.info(`[CDC] step=consent endpoint=${endpoint} start`)

      let response: GigyaResponse
      try {
        response = await Gigya.getInstance().request(endpointUrl, body, {
          step: 'consent',
          endpoint,
          retryOptions: this.retryOptions,
        })
      } catch (error) {
        console.error(`[CDC] step=consent endpoint=${endpoint} failure elapsedMs=${Date.now() - startedAt}`)
        throw this.formatGigyaError('Error setting consent', endpoint, error)
      }

      const elapsedMs = Date.now() - startedAt
      const status = response.errorCode === 0 ? 'success' : 'api-error'
      console.info(`[CDC] step=consent endpoint=${endpoint} ${status} elapsedMs=${elapsedMs} statusCode=${response.statusCode ?? 'n/a'} errorCode=${response.errorCode ?? 'n/a'}`)

      if (response.errorCode === 400006) {
        if (refreshAttempt >= TOKEN_REFRESH_RETRIES) {
          const details = response.errorDetails ? response.errorDetails : response.errorMessage
          return Promise.reject(new Error(`Error setting consent. endpoint=${endpoint}, errorCode=${response.errorCode}, errorMessage=${details}`))
        }
        // regToken expired; request a fresh token and retry once.
        this.token = await this.getToken()
        body.regToken = this.token
        continue
      }

      if (response.errorCode !== 0) {
        const details = response.errorDetails ? response.errorDetails : response.errorMessage
        return Promise.reject(new Error(`Error setting consent. endpoint=${endpoint}, errorCode=${response.errorCode}, errorMessage=${details}`))
      }

      return response
    }

    return Promise.reject(new Error(`Error setting consent. endpoint=${endpoint}, errorMessage=unexpected retry flow`))
  }

  async setLatestUsages(email: string, usages: Usage[]): Promise<GigyaResponse> {
    return this.enqueue(() => this.doSetLatestUsages(email, usages))
  }

  private async doSetLatestUsages(email: string, usages: Usage[]): Promise<GigyaResponse> {
    if (!this.token.length) {
      this.token = await this.getToken()
    }
    const body: Params = {
      apiKey: this.apiKey,
      profile: JSON.stringify({
        email: email,
      }),
      regToken: this.token,
    }
    body.data = JSON.stringify({ latestUsages: usages })

    const endpoint = 'setAccountInfo'
    const endpointUrl = this.buildAccountEndpoint(endpoint)

    for (let refreshAttempt = 0; refreshAttempt <= TOKEN_REFRESH_RETRIES; refreshAttempt += 1) {
      const startedAt = Date.now()
      console.info(`[CDC] step=usage-write endpoint=${endpoint} start`)

      let response: GigyaResponse
      try {
        response = await Gigya.getInstance().request(endpointUrl, body, {
          step: 'usage-write',
          endpoint,
          retryOptions: this.retryOptions,
        })
      } catch (error) {
        console.error(`[CDC] step=usage-write endpoint=${endpoint} failure elapsedMs=${Date.now() - startedAt}`)
        throw this.formatGigyaError('Error setting latest usages', endpoint, error)
      }

      const elapsedMs = Date.now() - startedAt
      const status = response.errorCode === 0 ? 'success' : 'api-error'
      console.info(`[CDC] step=usage-write endpoint=${endpoint} ${status} elapsedMs=${elapsedMs} statusCode=${response.statusCode ?? 'n/a'} errorCode=${response.errorCode ?? 'n/a'}`)

      if (response.errorCode === 400006) {
        if (refreshAttempt >= TOKEN_REFRESH_RETRIES) {
          const details = response.errorDetails ? response.errorDetails : response.errorMessage
          return Promise.reject(new Error(`Error setting latest usages. endpoint=${endpoint}, errorCode=${response.errorCode}, errorMessage=${details}`))
        }
        // regToken expired; request a fresh token and retry once.
        this.token = await this.getToken()
        body.regToken = this.token
        continue
      }

      if (response.errorCode !== 0) {
        const details = response.errorDetails ? response.errorDetails : response.errorMessage
        return Promise.reject(new Error(`Error setting latest usages. endpoint=${endpoint}, errorCode=${response.errorCode}, errorMessage=${details}`))
      }

      return response
    }

    return Promise.reject(new Error(`Error setting latest usages. endpoint=${endpoint}, errorMessage=unexpected retry flow`))
  }
}
