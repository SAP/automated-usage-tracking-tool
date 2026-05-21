import AOAClient, { AOAConfig, TrackingReport } from '../aoa/aoaClient'
import { getToolByName } from '../aoa/toolRegistry'

const FIXED_FIELDS = {
  customerName: 'MULTIPLE',
  customerId: 'MULTIPLE',
  receiverCostObject: 'MULTIPLE',
  receiverRegion: 'MULTIPLE',
  executor: 'MULTIPLE',
  executorCostCenter: '144496124',
}



declare const chrome: {
  storage?: {
    local?: {
      get: (keys: string[]) => Promise<Record<string, string | undefined>>
    }
  }
}

function getLocalStorageItem(key: string): string | undefined {
  try {
    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem(key) ?? undefined
      if (value) console.debug(`[AOA] localStorage: found "${key}"`)
      return value
    }
  } catch {
    console.debug(`[AOA] localStorage: not available`)
  }
  return undefined
}

function hasChromeStorageLocal(): boolean {
  try {
    const available = typeof chrome !== 'undefined' && !!chrome.storage?.local?.get
    console.debug(`[AOA] chrome.storage.local: ${available ? 'available' : 'not available'}`)
    return available
  } catch {
    console.debug('[AOA] chrome.storage.local: not available (error checking)')
    return false
  }
}

async function getChromeStorageItems(keys: string[]): Promise<Record<string, string | undefined>> {
  if (!hasChromeStorageLocal()) return {}
  try {
    const result = await chrome.storage!.local!.get(keys)
    const foundKeys = Object.keys(result).filter((k) => result[k] !== undefined)
    if (foundKeys.length > 0) {
      console.debug(`[AOA] chrome.storage.local: found keys [${foundKeys.join(', ')}]`)
    } else {
      console.debug('[AOA] chrome.storage.local: no AOA keys found')
    }
    return result
  } catch (e) {
    console.debug('[AOA] chrome.storage.local: error reading -', e)
    return {}
  }
}

async function resolveConfigAsync(trackerArguments?: TrackerArguments): Promise<AOAConfig | null> {
  console.debug('[AOA] Resolving configuration...')
  console.debug('[AOA] Constructor args provided:', trackerArguments ? `clientId=${trackerArguments.clientId ? '***' : 'none'}, proxyUrl=${trackerArguments.proxyUrl || 'none'}` : 'none')

  const env = typeof process !== 'undefined' && process.env ? process.env : ({} as Record<string, string | undefined>)

  // Read chrome.storage.local (async) — highest priority after constructor args
  const chromeStorage = await getChromeStorageItems([
    'aoaClientId', 'aoaClientSecret', 'aoaTokenUrl', 'aoaApiUrl', 'aoaProxyUrl',
  ])

  const config: AOAConfig = {
    clientId: trackerArguments?.clientId ?? chromeStorage.aoaClientId ?? getLocalStorageItem('aoaClientId') ?? env.AOA_CLIENT_ID ?? '',
    clientSecret: trackerArguments?.clientSecret ?? chromeStorage.aoaClientSecret ?? getLocalStorageItem('aoaClientSecret') ?? env.AOA_CLIENT_SECRET ?? '',
    tokenUrl: trackerArguments?.tokenUrl ?? chromeStorage.aoaTokenUrl ?? getLocalStorageItem('aoaTokenUrl') ?? env.AOA_TOKEN_URL ?? '',
    apiUrl: trackerArguments?.apiUrl ?? chromeStorage.aoaApiUrl ?? getLocalStorageItem('aoaApiUrl') ?? env.AOA_API_URL ?? '',
    proxyUrl: trackerArguments?.proxyUrl ?? chromeStorage.aoaProxyUrl ?? getLocalStorageItem('aoaProxyUrl') ?? env.AOA_PROXY_URL ?? undefined,
  }

  if (!config.clientId || !config.clientSecret || !config.tokenUrl || !config.apiUrl) {
    const missing = [
      !config.clientId && 'clientId',
      !config.clientSecret && 'clientSecret',
      !config.tokenUrl && 'tokenUrl',
      !config.apiUrl && 'apiUrl',
    ].filter(Boolean).join(', ')
    console.debug(`[AOA] Config resolution result: MISSING fields (${missing})`)
    return null
  }

  console.debug(`[AOA] Config resolution result: OK (clientId=***${config.clientId.slice(-4)}, tokenUrl=${config.tokenUrl}, apiUrl=${config.apiUrl}, proxyUrl=${config.proxyUrl || 'none'})`)
  return config
}

export default class Tracker {
  aoaClient: AOAClient | null = null
  private trackerArguments?: TrackerArguments
  private initPromise: Promise<void> | null = null
  private initialized = false

  constructor(trackerArguments?: TrackerArguments) {
    console.debug('[AOA] Tracker instance created (lazy init — will resolve config on first trackUsage call)')
    this.trackerArguments = trackerArguments
  }

  private async ensureInitialized(): Promise<boolean> {
    if (this.initialized) return this.aoaClient !== null
    if (!this.initPromise) {
      console.debug('[AOA] First tracking call — initializing...')
      this.initPromise = this.init()
    }
    await this.initPromise
    return this.aoaClient !== null
  }

  private async init(): Promise<void> {
    const config = await resolveConfigAsync(this.trackerArguments)
    if (config) {
      this.aoaClient = new AOAClient(config)
      console.debug('[AOA] Tracking initialized successfully.')
    } else {
      console.warn('[AOA] Tracking disabled: configuration incomplete. Required keys: aoaClientId, aoaClientSecret, aoaTokenUrl, aoaApiUrl. Set them via chrome.storage.local, localStorage, or environment variables (AOA_CLIENT_ID, AOA_CLIENT_SECRET, AOA_TOKEN_URL, AOA_API_URL).')
    }
    this.initialized = true
  }

  /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
  async requestConsentQuestion(_consentArguments?: ConsentArguments): Promise<boolean> {
    return true
  }

  /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
  async requestConsentConfirmation(_consentArguments?: ConsentArguments): Promise<boolean> {
    return true
  }

  /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
  async provideConsentQuestionAnswer(_consentArguments?: ConsentArguments): Promise<boolean> {
    return true
  }

  /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
  async provideConsentConfirmAnswer(_consentArguments?: ConsentArguments): Promise<boolean> {
    return true
  }

  /** @deprecated Consent is always granted with AOA. Always returns true. */
  isConsentGranted(): boolean {
    return true
  }

  async trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void> {
    console.debug(`[AOA] trackUsage called: toolName="${trackUsageArguments.toolName}"`)
    const ready = await this.ensureInitialized()
    if (!ready) {
      console.debug('[AOA] trackUsage skipped: not configured')
      return
    }
    const report = this.buildReport(trackUsageArguments)
    console.debug(`[AOA] Sending report: toolId=${report.toolId}, date=${report.date}`)
    await this.aoaClient!.sendTrackingReport([report])
    console.debug('[AOA] Report sent successfully')
  }

  async trackUsages(trackUsageArguments: TrackUsageArguments[]): Promise<void> {
    console.debug(`[AOA] trackUsages called: ${trackUsageArguments.length} items`)
    const ready = await this.ensureInitialized()
    if (!ready) {
      console.debug('[AOA] trackUsages skipped: not configured')
      return
    }
    const reports = trackUsageArguments.map((args) => this.buildReport(args))
    console.debug(`[AOA] Sending ${reports.length} reports`)
    await this.aoaClient!.sendTrackingReport(reports)
    console.debug('[AOA] Reports sent successfully')
  }

  private buildReport(args: TrackUsageArguments): TrackingReport {
    const tool = getToolByName(args.toolName)

    if (!tool) {
      throw new Error(`Tool not found: ${args.toolName}`)
    }

    return {
      toolId: tool.toolId,
      numberOfExecutions: 1,
      actualEffortReduction: tool.actualEffortReduction,
      date: new Date().toISOString().split('T')[0],
      ...FIXED_FIELDS,
    }
  }
}

export interface TrackerArguments {
  clientId?: string
  clientSecret?: string
  tokenUrl?: string
  apiUrl?: string
  proxyUrl?: string
  /** @deprecated No longer used. Kept for backward compatibility. */
  apiKey?: string
  /** @deprecated No longer used. Kept for backward compatibility. */
  dataCenter?: string
  /** @deprecated No longer used. Kept for backward compatibility. */
  storageName?: string
}

/** @deprecated Consent is no longer required for AOA tracking. */
export interface ConsentArguments {
  email?: string
  message?: string
}

export interface TrackUsageArguments {
  toolName: string
  /** @deprecated No longer used. Kept for backward compatibility. */
  featureName?: string
}
