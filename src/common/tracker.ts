import AOAClient, { AOAConfig, TrackingReport } from '../aoa/aoaClient'
import { getToolByName } from '../aoa/toolRegistry'
import Storage from './storage'
import Account from '../gigya/account'
import Consent from './consent'
import { GigyaRetryOptions } from '../gigya/gigya'

const AOA_FIXED_FIELDS = {
  customerName: 'MULTIPLE',
  customerId: 'MULTIPLE',
  receiverCostObject: 'MULTIPLE',
  receiverRegion: 'MULTIPLE',
  executor: 'MULTIPLE',
  executorCostCenter: '144496124',
}

type TrackingChannel = 'CDC' | 'AOA'

interface ChannelResult {
  channel: TrackingChannel
  success: boolean
  error?: Error
}

class MultiChannelTrackingError extends Error {
  channelErrors: Record<string, string>

  constructor(results: ChannelResult[]) {
    const failedResults = results.filter((result) => !result.success)
    const details = failedResults
      .map((result) => `${result.channel}: ${result.error?.message ?? 'Unknown error'}`)
      .join('; ')
    super(`Tracking failed for all configured channels. ${details}`)
    this.name = 'MultiChannelTrackingError'
    this.channelErrors = failedResults.reduce<Record<string, string>>((acc, result) => {
      acc[result.channel] = result.error?.message ?? 'Unknown error'
      return acc
    }, {})
  }
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
      return localStorage.getItem(key) ?? undefined
    }
  } catch {
    // localStorage not available
  }
  return undefined
}

async function getChromeStorageItems(keys: string[]): Promise<Record<string, string | undefined>> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local?.get) {
      return await chrome.storage.local.get(keys)
    }
  } catch {
    // chrome.storage.local not available
  }
  return {}
}

const AOA_DEFAULT_TOKEN_URL = 'https://sapit-crossfunctions-prod-ragdoll.authentication.eu10.hana.ondemand.com/oauth/token'
const AOA_DEFAULT_API_URL = 'https://asc-auto-ops-tracking-api-prod.cfapps.eu10-004.hana.ondemand.com'
const CDC_COMPLETION_WAIT_MS = 1500
const CONSENT_EMAIL_DOMAIN = '@automated-usage-tracking-tool.sap'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function hashIdentifier(value: string): string {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return (hash >>> 0).toString(16)
}

function resolveConsentEmail(rawValue?: string): string {
  const normalized = rawValue?.trim()
  if (!normalized) {
    return crypto.randomUUID() + CONSENT_EMAIL_DOMAIN
  }

  if (isValidEmail(normalized)) {
    return normalized
  }

  const anonymizedId = hashIdentifier(normalized).slice(0, 10)
  const randomPart = crypto.randomUUID().split('-')[0]
  return `anon-${anonymizedId}-${randomPart}${CONSENT_EMAIL_DOMAIN}`
}

async function resolveAOAConfig(trackerArguments?: TrackerArguments): Promise<AOAConfig | null> {
  const env = typeof process !== 'undefined' && process.env ? process.env : ({} as Record<string, string | undefined>)

  const chromeStorage = await getChromeStorageItems([
    'aoaClientId', 'aoaClientSecret', 'aoaTokenUrl', 'aoaApiUrl', 'aoaProxyUrl',
  ])

  const clientId = trackerArguments?.clientId ?? chromeStorage.aoaClientId ?? getLocalStorageItem('aoaClientId') ?? env.AOA_CLIENT_ID ?? ''
  const clientSecret = trackerArguments?.clientSecret ?? chromeStorage.aoaClientSecret ?? getLocalStorageItem('aoaClientSecret') ?? env.AOA_CLIENT_SECRET ?? ''
  const tokenUrl = trackerArguments?.tokenUrl ?? chromeStorage.aoaTokenUrl ?? getLocalStorageItem('aoaTokenUrl') ?? env.AOA_TOKEN_URL ?? AOA_DEFAULT_TOKEN_URL
  const apiUrl = trackerArguments?.apiUrl ?? chromeStorage.aoaApiUrl ?? getLocalStorageItem('aoaApiUrl') ?? env.AOA_API_URL ?? AOA_DEFAULT_API_URL
  const proxyUrl = trackerArguments?.proxyUrl ?? chromeStorage.aoaProxyUrl ?? getLocalStorageItem('aoaProxyUrl') ?? env.AOA_PROXY_URL ?? undefined

  const config: AOAConfig = { clientId, clientSecret, tokenUrl, apiUrl, proxyUrl }

  if (!config.clientId || !config.clientSecret) {
    return null
  }

  return config
}

export default abstract class Tracker {
  apiKey: string
  dataCenter: string
  storage: Storage
  account: Account
  consent: Consent

  aoaClient: AOAClient | null = null
  private trackerArguments?: TrackerArguments
  private aoaInitPromise: Promise<void> | null = null
  private aoaInitialized = false

  constructor(trackerArguments: TrackerArguments, storage: Storage, consent: Consent) {
    this.apiKey = trackerArguments.apiKey ?? ''
    this.dataCenter = trackerArguments.dataCenter ?? ''
    this.storage = storage
    this.consent = consent
    this.trackerArguments = trackerArguments

    if (trackerArguments.apiKey && trackerArguments.dataCenter) {
      this.account = new Account(trackerArguments.apiKey, trackerArguments.dataCenter, trackerArguments.cdcRetryOptions)
    } else {
      this.account = new Account('', '')
    }
  }

  private async ensureAOAInitialized(): Promise<boolean> {
    if (this.aoaInitialized) return this.aoaClient !== null
    if (!this.aoaInitPromise) {
      this.aoaInitPromise = this.initAOA()
    }
    await this.aoaInitPromise
    return this.aoaClient !== null
  }

  private async initAOA(): Promise<void> {
    const config = await resolveAOAConfig(this.trackerArguments)
    if (config) {
      this.aoaClient = new AOAClient(config)
    }
    this.aoaInitialized = true
  }

  async requestConsentQuestion(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.requestConsent(this.consent.askConsentQuestion.bind(this.consent), consentArguments)
  }

  async requestConsentConfirmation(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.requestConsent(this.consent.askConsentConfirm.bind(this.consent), consentArguments)
  }

  public async provideConsentQuestionAnswer(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.requestConsent(this.consent.provideConsentQuestionAnswer.bind(this.consent), consentArguments)
  }

  public async provideConsentConfirmAnswer(consentArguments: ConsentArguments): Promise<boolean> {
    return await this.requestConsent(this.consent.provideConsentConfirmAnswer.bind(this.consent), consentArguments)
  }

  async trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void> {
    const cdcEnabled = this.apiKey.length > 0 && this.dataCenter.length > 0 && this.storage.isConsentGranted()
    const aoaEnabled = await this.ensureAOAInitialized()

    if (!cdcEnabled && !aoaEnabled) {
      console.info('[TRACKING] No channel configured or eligible for tracking. Skipping.')
      return
    }

    const cdcPromise = cdcEnabled
      ? this.executeChannel('CDC', async () => {
        this.storage.setLatestUsage(trackUsageArguments.toolName, trackUsageArguments.featureName)
        await this.account.setLatestUsages(this.storage.getEmail(), this.storage.getLatestUsages())
      })
      : null

    const aoaPromise = aoaEnabled
      ? this.executeChannel('AOA', async () => {
        const report = this.buildAOAReport(trackUsageArguments)
        await this.aoaClient!.sendTrackingReport([report])
      })
      : null

    if (!aoaPromise && cdcPromise) {
      const cdcResult = await cdcPromise
      if (!cdcResult.success) {
        throw cdcResult.error
      }
      console.info('[TRACKING] Completed. CDC=success, AOA=not-configured')
      return
    }

    if (!cdcPromise && aoaPromise) {
      const aoaResult = await aoaPromise
      if (!aoaResult.success) {
        throw aoaResult.error
      }
      console.info('[TRACKING] Completed. CDC=not-configured, AOA=success')
      return
    }

    const aoaResult = await aoaPromise!
    if (aoaResult.success) {
      const cdcResult = await this.waitForCdcWithinWindow(cdcPromise!)
      if (cdcResult) {
        const cdcStatus = cdcResult.success ? 'success' : 'failure'
        const details = cdcResult.error ? ` (${cdcResult.error.message})` : ''
        console.info(`[TRACKING] Completed with success via AOA. CDC=${cdcStatus}${details}`)
      } else {
        console.info(`[TRACKING] Completed with success via AOA. CDC still running after ${CDC_COMPLETION_WAIT_MS}ms window.`)
        void cdcPromise!.then((resolvedCdcResult) => {
          const cdcStatus = resolvedCdcResult.success ? 'success' : 'failure'
          const details = resolvedCdcResult.error ? ` (${resolvedCdcResult.error.message})` : ''
          console.info(`[TRACKING] Final channel status update. CDC=${cdcStatus}${details}, AOA=success`)
        })
      }
      return
    }

    const cdcResult = await cdcPromise!
    if (cdcResult.success) {
      console.error(`[TRACKING] Completed with failure. CDC=success, AOA=failure (${aoaResult.error?.message ?? 'Unknown error'})`)
      throw aoaResult.error
    }

    const aggregatedError = new MultiChannelTrackingError([cdcResult, aoaResult])
    console.error(`[TRACKING] Completed with failure. CDC=failure (${cdcResult.error?.message ?? 'Unknown error'}), AOA=failure (${aoaResult.error?.message ?? 'Unknown error'})`)
    throw aggregatedError
  }

  private async executeChannel(channel: TrackingChannel, action: () => Promise<void>): Promise<ChannelResult> {
    console.info(`[${channel}] start`)
    try {
      await action()
      console.info(`[${channel}] success`)
      return { channel, success: true }
    } catch (error) {
      const channelError = error instanceof Error ? error : new Error(String(error))
      console.error(`[${channel}] failure: ${channelError.message}`)
      return {
        channel,
        success: false,
        error: channelError,
      }
    }
  }

  private async waitForCdcWithinWindow(cdcPromise: Promise<ChannelResult>): Promise<ChannelResult | null> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const timeoutPromise = new Promise<null>((resolve) => {
      timeoutId = setTimeout(() => resolve(null), CDC_COMPLETION_WAIT_MS)
    })
    const result = await Promise.race<ChannelResult | null>([cdcPromise, timeoutPromise])
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    return result
  }

  async trackUsages(trackUsageArguments: TrackUsageArguments[]): Promise<void> {
    const ready = await this.ensureAOAInitialized()
    if (!ready) return
    const reports = trackUsageArguments.map((args) => this.buildAOAReport(args))
    await this.aoaClient!.sendTrackingReport(reports)
  }

  isConsentGranted(): boolean {
    return this.storage.isConsentGranted()
  }

  private buildAOAReport(args: TrackUsageArguments): TrackingReport {
    const tool = getToolByName(args.toolName)
    if (!tool) {
      throw new Error(`Tool not found: ${args.toolName}`)
    }
    return {
      toolId: tool.toolId,
      numberOfExecutions: 1,
      actualEffortReduction: tool.actualEffortReduction,
      date: new Date().toISOString().split('T')[0],
      ...AOA_FIXED_FIELDS,
    }
  }

  private async requestConsent(consentFunction: ConsentFunction, consentArguments: ConsentArguments): Promise<boolean> {
    if (!this.storage.isConsentGranted()) {
      const consentResponse = await consentFunction(consentArguments.message)
      if (consentResponse) {
        const email = resolveConsentEmail(consentArguments.email)
        this.storage.setConsentGranted(consentResponse, email)
        await this.account.setConsent(consentResponse, email)
      }
      return consentResponse
    }
    return true
  }
}

type ConsentFunction = (message?: string) => Promise<boolean>

export interface TrackerArguments {
  apiKey?: string
  dataCenter?: string
  storageName?: string
  cdcRetryOptions?: GigyaRetryOptions
  clientId?: string
  clientSecret?: string
  tokenUrl?: string
  apiUrl?: string
  proxyUrl?: string
}

export interface ConsentArguments {
  email?: string
  message?: string
}

export interface TrackUsageArguments {
  toolName: string
  featureName?: string
}
