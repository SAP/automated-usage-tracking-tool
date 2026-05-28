type Params = Record<string, string>

export interface GigyaRetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  jitterRatio?: number
}

export type GigyaStep = 'token' | 'consent' | 'usage-write' | 'unknown'

export interface GigyaRequestContext {
  step?: GigyaStep
  retryOptions?: GigyaRetryOptions
  endpoint?: string
}

interface NormalizedRetryOptions {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  jitterRatio: number
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
  UID?: string
}

export type GigyaErrorKind = 'network' | 'http' | 'json-parse' | 'api-error-code' | 'unknown'

export class GigyaRequestError extends Error {
  kind: GigyaErrorKind
  retryable: boolean
  step: GigyaStep
  attempt: number
  endpoint: string
  statusCode?: number
  contentType?: string
  bodySnippet?: string
  errorCode?: number
  errorMessage?: string

  constructor(args: {
    message: string
    kind: GigyaErrorKind
    retryable: boolean
    step: GigyaStep
    attempt: number
    endpoint: string
    statusCode?: number
    contentType?: string
    bodySnippet?: string
    errorCode?: number
    errorMessage?: string
  }) {
    super(args.message)
    this.name = 'GigyaRequestError'
    this.kind = args.kind
    this.retryable = args.retryable
    this.step = args.step
    this.attempt = args.attempt
    this.endpoint = args.endpoint
    this.statusCode = args.statusCode
    this.contentType = args.contentType
    this.bodySnippet = args.bodySnippet
    this.errorCode = args.errorCode
    this.errorMessage = args.errorMessage
  }
}

class Gigya {
  private static readonly RETRYABLE_ERRORS = ['ERR_BAD_RESPONSE', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'ERR_SOCKET_CONNECTION_TIMEOUT']
  private static readonly RETRYABLE_ERROR_CODES = [403048, 500001]
  private static readonly DEFAULT_RETRY_OPTIONS: NormalizedRetryOptions = {
    maxRetries: 4,
    baseDelayMs: 400,
    maxDelayMs: 5000,
    jitterRatio: 0.2,
  }

  private static instance: Gigya

  private constructor() {}

  static getInstance(): Gigya {
    if (!this.instance) {
      this.instance = new Gigya()
    }
    return this.instance
  }

  private resolveRetryOptions(overrides?: GigyaRetryOptions): NormalizedRetryOptions {
    const merged = {
      ...Gigya.DEFAULT_RETRY_OPTIONS,
      ...(overrides ?? {}),
    }

    return {
      maxRetries: Math.max(0, merged.maxRetries),
      baseDelayMs: Math.max(0, merged.baseDelayMs),
      maxDelayMs: Math.max(0, merged.maxDelayMs),
      jitterRatio: Math.min(1, Math.max(0, merged.jitterRatio)),
    }
  }

  private buildDelay(attempt: number, retryOptions: NormalizedRetryOptions): number {
    const exponentialDelay = Math.min(retryOptions.maxDelayMs, retryOptions.baseDelayMs * (2 ** attempt))
    const jitter = exponentialDelay * retryOptions.jitterRatio * Math.random()
    return Math.floor(exponentialDelay + jitter)
  }

  private normalizeError(error: unknown, step: GigyaStep, attempt: number, endpoint: string): GigyaRequestError {
    if (error instanceof GigyaRequestError) {
      return error
    }

    const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: unknown }).code) : undefined
    const message = error instanceof Error ? error.message : String(error)
    const retryable = code !== undefined && Gigya.RETRYABLE_ERRORS.includes(code)

    return new GigyaRequestError({
      message: `Gigya request failed (${step}) [attempt=${attempt}]${code ? ` [code=${code}]` : ''}: ${message}`,
      kind: retryable ? 'network' : 'unknown',
      retryable,
      step,
      attempt,
      endpoint,
      errorMessage: message,
    })
  }

  private getResponseRetryReason(response: GigyaResponse): string | null {
    if (response.code !== undefined && Gigya.RETRYABLE_ERRORS.includes(response.code)) {
      return `retryable-code:${response.code}`
    }

    if (response.errorCode !== undefined && Gigya.RETRYABLE_ERROR_CODES.includes(response.errorCode)) {
      return `retryable-errorCode:${response.errorCode}`
    }

    if (response.errorMessage?.toLowerCase().includes('rate limit')) {
      return `retryable-errorMessage:${response.errorMessage}`
    }

    return null
  }

  private async post(url: string, body: Params, step: GigyaStep, attempt: number, endpoint: string): Promise<GigyaResponse> {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    }

    const response = await fetch(url, requestOptions)

    if (typeof (response as { text?: unknown }).text === 'function') {
      const statusCode = (response as { status?: number }).status
      const statusText = (response as { statusText?: string }).statusText ?? 'Unknown status'
      const contentType = typeof (response as { headers?: { get?: (name: string) => string | null } }).headers?.get === 'function'
        ? (response as { headers?: { get?: (name: string) => string | null } }).headers!.get!('content-type') ?? undefined
        : undefined
      const rawBody = await (response as { text: () => Promise<string> }).text()

      try {
        return JSON.parse(rawBody) as GigyaResponse
      } catch {
        const bodySnippet = rawBody.slice(0, 180).replace(/\s+/g, ' ').trim()
        throw new GigyaRequestError({
          message: `Gigya non-JSON response (${step}) [attempt=${attempt}] [status=${statusCode ?? 'unknown'}] [contentType=${contentType ?? 'unknown'}]`,
          kind: 'json-parse',
          retryable: false,
          step,
          attempt,
          endpoint,
          statusCode,
          contentType,
          bodySnippet,
          errorMessage: statusText,
        })
      }
    }

    if (typeof (response as { json?: unknown }).json === 'function') {
      return await (response as { json: () => Promise<GigyaResponse> }).json()
    }

    throw new GigyaRequestError({
      message: `Gigya response cannot be parsed (${step}) [attempt=${attempt}]`,
      kind: 'unknown',
      retryable: false,
      step,
      attempt,
      endpoint,
    })
  }

  async request(url: string, params: Params, context?: GigyaRequestContext): Promise<GigyaResponse> {
    const body = { ...params }

    const step = context?.step ?? 'unknown'
    const endpoint = context?.endpoint ?? url.split('/').pop() ?? 'unknown'
    const retryOptions = this.resolveRetryOptions(context?.retryOptions)

    for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt += 1) {
      const startedAt = Date.now()
      try {
        const response = await this.post(url, body, step, attempt, endpoint)
        const retryReason = this.getResponseRetryReason(response)

        if (!retryReason) {
          return response
        }

        const elapsedMs = Date.now() - startedAt
        if (attempt >= retryOptions.maxRetries) {
          throw new GigyaRequestError({
            message: `Gigya retry limit reached (${step}) [attempt=${attempt}] [reason=${retryReason}]`,
            kind: 'api-error-code',
            retryable: true,
            step,
            attempt,
            endpoint,
            statusCode: response.statusCode,
            errorCode: response.errorCode,
            errorMessage: response.errorMessage,
          })
        }

        const delayMs = this.buildDelay(attempt, retryOptions)
        console.warn(`[CDC] step=${step} endpoint=${endpoint} attempt=${attempt + 1} elapsedMs=${elapsedMs} statusCode=${response.statusCode ?? 'n/a'} errorCode=${response.errorCode ?? 'n/a'} errorMessage=${response.errorMessage ?? response.code ?? 'n/a'} retryInMs=${delayMs}`)
        await this.delay(delayMs)
      } catch (error) {
        const normalizedError = this.normalizeError(error, step, attempt, endpoint)
        const elapsedMs = Date.now() - startedAt

        if (!normalizedError.retryable || attempt >= retryOptions.maxRetries) {
          throw normalizedError
        }

        const delayMs = this.buildDelay(attempt, retryOptions)
        console.warn(`[CDC] step=${step} endpoint=${endpoint} attempt=${attempt + 1} elapsedMs=${elapsedMs} kind=${normalizedError.kind} statusCode=${normalizedError.statusCode ?? 'n/a'} errorCode=${normalizedError.errorCode ?? 'n/a'} errorMessage=${normalizedError.errorMessage ?? normalizedError.message} retryInMs=${delayMs}`)
        await this.delay(delayMs)
      }
    }

    throw new GigyaRequestError({
      message: `Gigya request failed unexpectedly (${step})`,
      kind: 'unknown',
      retryable: false,
      step,
      attempt: retryOptions.maxRetries,
      endpoint,
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export default Gigya
