import { getToolByName } from './toolRegistry'

export interface AOAConfig {
  clientId: string
  clientSecret: string
  tokenUrl: string
  apiUrl: string
  proxyUrl?: string
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

declare const chrome: {
  runtime?: {
    sendMessage?: (message: unknown, callback: (response: unknown) => void) => void
    lastError?: { message: string }
  }
}

declare const window: {
  postMessage: (message: unknown, targetOrigin: string) => void
  addEventListener: (type: string, listener: (event: MessageEvent) => void) => void
  removeEventListener: (type: string, listener: (event: MessageEvent) => void) => void
} | undefined

interface ProxyFetchResponse {
  ok: boolean
  status: number
  statusText: string
  body: string
  error?: string
}


function isChromeExtension(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.runtime?.sendMessage
}

function isBrowserWithPostMessage(): boolean {
  return typeof window !== 'undefined' && !!window && typeof window.postMessage === 'function'
}

function serializeHeaders(options: RequestInit): Record<string, string> | undefined {
  if (options.headers instanceof Headers) {
    const headers: Record<string, string> = {}
    options.headers.forEach((value, key) => {
      headers[key] = value
    })
    return headers
  }
  return options.headers as Record<string, string> | undefined
}

function chromeProxyFetch(url: string, options: RequestInit = {}): Promise<Response> {
  console.debug('[AOA] Using chrome.runtime.sendMessage proxy for:', url)
  const serializedOptions = {
    method: options.method,
    headers: serializeHeaders(options),
    body: typeof options.body === 'string' ? options.body : options.body?.toString(),
  }

  return new Promise((resolve, reject) => {
    chrome.runtime!.sendMessage!({ type: 'proxy-fetch', url, options: serializedOptions }, (response: unknown) => {
      if (chrome.runtime!.lastError) {
        console.error('[AOA] chrome.runtime.sendMessage error:', chrome.runtime!.lastError.message)
        return reject(new Error(chrome.runtime!.lastError.message))
      }
      const res = response as ProxyFetchResponse | null
      if (!res || res.error) {
        console.error('[AOA] Proxy response error:', res?.error || 'No response')
        return reject(new Error(res?.error || 'Proxy fetch failed'))
      }
      console.debug('[AOA] Proxy response received:', res.status, res.statusText)
      resolve(new Response(res.body, { status: res.status, statusText: res.statusText }))
    })
  })
}

function postMessageProxyFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const requestId = `aoa-fetch-${Date.now()}-${Math.random().toString(36).slice(2)}`
  console.debug('[AOA] Using window.postMessage proxy for:', url, '(requestId:', requestId, ')')
  const serializedOptions = {
    method: options.method,
    headers: serializeHeaders(options),
    body: typeof options.body === 'string' ? options.body : options.body?.toString(),
  }

  return new Promise((resolve, reject) => {
    const w = window!

    const timeout = setTimeout(() => {
      w.removeEventListener('message', handler)
      console.error('[AOA] Proxy timeout: no bridge content script responded after 30s. Ensure the extension is installed, the manifest content_scripts "matches" includes this page URL, and the page was reloaded after installing the extension.')
      reject(new Error('AOA proxy fetch timeout: no bridge content script responded. Ensure the extension is installed and the page was reloaded.'))
    }, 30000)

    function handler(event: MessageEvent) {
      if (event.data?.type !== 'aoa-proxy-response' || event.data?.requestId !== requestId) {
        return
      }
      w.removeEventListener('message', handler)
      clearTimeout(timeout)
      const res = event.data as ProxyFetchResponse & { type: string; requestId: string }
      if (!res.ok && res.error) {
        console.error('[AOA] Bridge proxy error:', res.error)
        return reject(new Error(res.error))
      }
      console.debug('[AOA] Bridge proxy response received:', res.status, res.statusText)
      resolve(new Response(res.body, { status: res.status, statusText: res.statusText }))
    }

    w.addEventListener('message', handler)
    w.postMessage({ type: 'aoa-proxy-request', requestId, url, options: serializedOptions }, '*')
  })
}

function corsProxyFetch(proxyUrl: string, url: string, options: RequestInit = {}): Promise<Response> {
  console.debug('[AOA] Using CORS proxy for:', url, '→', proxyUrl)
  const body = JSON.stringify({
    url,
    method: options.method || 'GET',
    headers: serializeHeaders(options),
    body: typeof options.body === 'string' ? options.body : options.body?.toString(),
  })

  return fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }).then(async (proxyResponse) => {
    if (!proxyResponse.ok) {
      const errorText = await proxyResponse.text().catch(() => proxyResponse.statusText)
      throw new Error(`AOA CORS proxy error (${proxyResponse.status}): ${errorText}`)
    }
    const data = await proxyResponse.json() as ProxyFetchResponse
    console.debug('[AOA] CORS proxy response:', data.status, data.statusText)
    return new Response(data.body, { status: data.status, statusText: data.statusText })
  })
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && !!window
}

async function aoaFetch(url: string, options: RequestInit = {}, proxyUrl?: string): Promise<Response> {
  // Strategy 1: Explicit CORS proxy URL (configured by user)
  if (proxyUrl) {
    console.debug('[AOA] Strategy: configured CORS proxy')
    return corsProxyFetch(proxyUrl, url, options)
  }

  // In non-browser environments (Node.js), direct fetch always works (no CORS)
  if (!isBrowser()) {
    console.debug('[AOA] Direct fetch (server environment):', url)
    return fetch(url, options)
  }

  // Strategy 2: chrome.runtime.sendMessage (Chrome Extension with active service worker)
  if (isChromeExtension()) {
    try {
      console.debug('[AOA] Strategy: chrome.runtime.sendMessage')
      return await chromeProxyFetch(url, options)
    } catch (e) {
      console.debug('[AOA] chrome.runtime.sendMessage failed:', (e as Error).message, '— trying next strategy')
    }
  }

  // Strategy 3: Direct fetch (might work if extension has host_permissions or CORS is enabled)
  try {
    console.debug('[AOA] Strategy: direct fetch')
    const response = await fetch(url, options)
    console.debug('[AOA] Direct fetch succeeded:', response.status)
    return response
  } catch (e) {
    console.debug('[AOA] Direct fetch failed (likely CORS):', (e as Error).message, '— trying next strategy')
  }

  // Strategy 4: postMessage bridge (extension with bridge content script)
  if (isBrowserWithPostMessage()) {
    try {
      console.debug('[AOA] Strategy: postMessage bridge')
      return await postMessageProxyFetch(url, options)
    } catch (e) {
      console.debug('[AOA] postMessage bridge failed:', (e as Error).message)
    }
  }

  // All strategies exhausted
  throw new Error(
    `[AOA] All fetch strategies failed for ${url}. ` +
    'This is likely a CORS issue. Possible solutions: ' +
    '1) Add a service worker with host_permissions to the extension manifest, ' +
    '2) Configure aoaProxyUrl pointing to a CORS proxy server, ' +
    '3) Use a backend/CLI environment where CORS does not apply.',
  )
}

export default class AOAClient {
  private accessToken: string = ''
  private tokenExpiresAt: number = 0

  constructor(private config: AOAConfig) {}

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    const response = await aoaFetch(this.config.tokenUrl, {
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
    }, this.config.proxyUrl)

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

    const response = await aoaFetch(`${this.config.apiUrl}/api/automations/tracking-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reports),
    }, this.config.proxyUrl)

    if (response.status === 201) {
      return
    }

    const errorBody: AOAErrorResponse = (await response.json().catch(() => ({ errorMessage: response.statusText }))) as AOAErrorResponse
    throw new Error(
      `AOA tracking error (${response.status}): ${errorBody.errorMessage}${errorBody.detailedErrors ? ' - ' + JSON.stringify(errorBody.detailedErrors) : ''}`,
    )
  }

  async trackUsage(toolName: string): Promise<void> {
    const report = buildReport(toolName)
    await this.sendTrackingReport([report])
  }


}

// --- Config resolution ---

const AOA_DEFAULT_TOKEN_URL = 'https://sapit-crossfunctions-prod-ragdoll.authentication.eu10.hana.ondemand.com/oauth/token'
const AOA_DEFAULT_API_URL = 'https://asc-auto-ops-tracking-api-prod.cfapps.eu10-004.hana.ondemand.com'

export interface AOATrackerOptions {
  clientId?: string
  clientSecret?: string
  tokenUrl?: string
  apiUrl?: string
  proxyUrl?: string
}

function getEnv(key: string): string | undefined {
  try {
    return typeof process !== 'undefined' && process.env ? process.env[key] : undefined
  } catch {
    return undefined
  }
}

function getLocalStorageItem(key: string): string | undefined {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key) ?? undefined
    }
  } catch {
    return undefined
  }
}

export function createAOAClient(options?: AOATrackerOptions): AOAClient | null {
  const clientId = options?.clientId ?? getLocalStorageItem('aoaClientId') ?? getEnv('AOA_CLIENT_ID') ?? ''
  const clientSecret = options?.clientSecret ?? getLocalStorageItem('aoaClientSecret') ?? getEnv('AOA_CLIENT_SECRET') ?? ''

  if (!clientId || !clientSecret) return null

  const tokenUrl = options?.tokenUrl ?? getLocalStorageItem('aoaTokenUrl') ?? getEnv('AOA_TOKEN_URL') ?? AOA_DEFAULT_TOKEN_URL
  const apiUrl = options?.apiUrl ?? getLocalStorageItem('aoaApiUrl') ?? getEnv('AOA_API_URL') ?? AOA_DEFAULT_API_URL
  const proxyUrl = options?.proxyUrl ?? getLocalStorageItem('aoaProxyUrl') ?? getEnv('AOA_PROXY_URL') ?? undefined

  return new AOAClient({ clientId, clientSecret, tokenUrl, apiUrl, proxyUrl })
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

function buildReport(toolName: string): TrackingReport {
  const tool = getToolByName(toolName)
  if (!tool) {
    throw new Error(`Tool not found in registry: ${toolName}`)
  }
  return {
    toolId: tool.toolId,
    numberOfExecutions: 1,
    actualEffortReduction: tool.actualEffortReduction,
    date: new Date().toISOString().split('T')[0],
    ...AOA_FIXED_FIELDS,
  }
}
