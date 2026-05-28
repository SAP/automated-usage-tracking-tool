vi.mock('../cli/fileStorage', () => ({
  default: vi.fn().mockImplementation(() => ({
    initStorage: vi.fn(),
    isConsentGranted: vi.fn(),
    setConsentGranted: vi.fn(),
    setLatestUsage: vi.fn(),
    getEmail: vi.fn(),
    getLatestUsages: vi.fn(),
  })),
}))
vi.mock('../web/webStorage', () => ({
  default: vi.fn().mockImplementation(() => ({
    initStorage: vi.fn(),
    isConsentGranted: vi.fn(),
    setConsentGranted: vi.fn(),
    setLatestUsage: vi.fn(),
    getEmail: vi.fn(),
    getLatestUsages: vi.fn(),
  })),
}))
vi.mock('./storage', () => ({
  default: vi.fn().mockImplementation(() => ({
    initStorage: vi.fn(),
    isConsentGranted: vi.fn(),
    setConsentGranted: vi.fn(),
    setLatestUsage: vi.fn(),
    getEmail: vi.fn(),
    getLatestUsages: vi.fn(),
  })),
}))
vi.mock('../gigya/account', () => ({
  default: vi.fn().mockImplementation(() => ({
    setConsent: vi.fn(),
    setLatestUsages: vi.fn(),
  })),
}))
vi.mock('../aoa/aoaClient', () => ({
  default: vi.fn().mockImplementation(() => ({
    sendTrackingReport: vi.fn().mockResolvedValue(undefined),
  })),
}))

import { describe, test, expect, vi, beforeEach } from 'vitest'
import CliTracker from '../cli/cliTracker'
import WebTracker from '../web/webTracker'
import Tracker from '../common/tracker'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Tracker', () => {
  const apiKey: string = 'apiKey'
  const dataCenter: string = 'eu1'
  const cliTracker: Tracker = new CliTracker({ apiKey, dataCenter })
  const webTracker: Tracker = new WebTracker({ apiKey, dataCenter })
  const email: string = 'email@domain.com'
  const toolName: string = 'tool name'

  test.each([cliTracker, webTracker])('consent is already granted', (tracker) => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(true)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    tracker.requestConsentConfirmation({})
    expect(spySetConsentGranted).not.toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('consent confirm is not granted', async (tracker) => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    vi.spyOn(tracker.consent, 'askConsentConfirm').mockReturnValue(Promise.reject(false))
    await expect(tracker.requestConsentConfirmation({})).rejects.toBeFalsy()
    expect(spySetConsentGranted).not.toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('consent confirm is granted', async (tracker) => {
    const consentResponse: boolean = true
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    vi.spyOn(tracker.consent, 'askConsentConfirm').mockReturnValue(Promise.resolve(consentResponse))
    await expect(tracker.requestConsentConfirmation({ email })).resolves.toBeTruthy()
    expect(spySetConsentGranted).toHaveBeenCalledWith(consentResponse, email)
    expect(spyAccount).toHaveBeenCalledWith(consentResponse, email)
  })

  test.each([cliTracker, webTracker])('consent question is not granted', async (tracker) => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    vi.spyOn(tracker.consent, 'askConsentQuestion').mockReturnValue(Promise.resolve(false))
    await expect(tracker.requestConsentQuestion({})).resolves.toBeFalsy()
    expect(spySetConsentGranted).not.toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('consent question is granted', async (tracker) => {
    const consentResponse: boolean = true
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    vi.spyOn(tracker.consent, 'askConsentQuestion').mockReturnValue(Promise.resolve(consentResponse))
    await expect(tracker.requestConsentQuestion({})).resolves.toBeTruthy()
    expect(spySetConsentGranted).toHaveBeenCalledWith(consentResponse, expect.stringContaining('@automated-usage-tracking-tool.sap'))
    expect(spyAccount).toHaveBeenCalledWith(consentResponse, expect.stringContaining('@automated-usage-tracking-tool.sap'))
  })

  test.each([cliTracker, webTracker])('track usage without consent', (tracker) => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetLatestUsage = vi.spyOn(tracker.storage, 'setLatestUsage')
    tracker.trackUsage({ toolName })
    expect(spySetLatestUsage).not.toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('track usage with consent', async (tracker) => {
    const featureName: string = 'feature name'
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(true)
    const spySetLatestUsage = vi.spyOn(tracker.storage, 'setLatestUsage')
    const spyAccount = vi.spyOn(tracker.account, 'setLatestUsages')
    await tracker.trackUsage({ toolName, featureName })
    expect(spySetLatestUsage).toHaveBeenCalledWith(toolName, featureName)
    expect(spyAccount).toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('track usage with provided consent question answer true', async (tracker) => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    await expect(tracker.provideConsentQuestionAnswer({ email, message: 'yes' })).resolves.toBeTruthy()
    expect(spySetConsentGranted).toHaveBeenCalledWith(true, email)
    expect(spyAccount).toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('track usage with provided consent question answer false', async (tracker) => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    await expect(tracker.provideConsentQuestionAnswer({ email, message: 'no' })).resolves.toBeFalsy()
    expect(spySetConsentGranted).not.toHaveBeenCalled()
    expect(spyAccount).not.toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('track usage with provided consent confirm answer true', async (tracker) => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    await expect(tracker.provideConsentConfirmAnswer({ email, message: 'yes' })).resolves.toBeTruthy()
    expect(spySetConsentGranted).toHaveBeenCalledWith(true, email)
    expect(spyAccount).toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('track usage with provided consent confirm answer and invalid email anonymizes identity', async (tracker) => {
    const invalidIdentity = 'I507070'
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')

    await expect(tracker.provideConsentConfirmAnswer({ email: invalidIdentity, message: 'yes' })).resolves.toBeTruthy()

    const [[consentValue, anonymizedEmail]] = spySetConsentGranted.mock.calls
    expect(consentValue).toBe(true)
    expect(anonymizedEmail).toMatch(/^anon-[a-f0-9]+-[a-f0-9]+@automated-usage-tracking-tool\.sap$/)
    expect(anonymizedEmail).not.toContain(invalidIdentity)
    expect(spyAccount).toHaveBeenCalledWith(true, anonymizedEmail)
  })

  test.each([cliTracker, webTracker])('track usage with provided consent confirm answer false', async (tracker) => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    await expect(tracker.provideConsentConfirmAnswer({ email, message: 'no' })).rejects.toBeFalsy()
    expect(spySetConsentGranted).not.toHaveBeenCalled()
    expect(spyAccount).not.toHaveBeenCalled()
  })
})

describe('Tracker AOA', () => {
  const aoaArgs = {
    apiKey: 'apiKey',
    dataCenter: 'eu1',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
  }

  test('trackUsage sends report to AOA by toolName', async () => {
    const tracker = new CliTracker(aoaArgs)
    await tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' })
    const today = new Date().toISOString().split('T')[0]
    expect(tracker.aoaClient).not.toBeNull()
    const spy = vi.spyOn(tracker.aoaClient!, 'sendTrackingReport')
    await tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' })
    expect(spy).toHaveBeenCalledWith([
      expect.objectContaining({
        toolId: '510',
        numberOfExecutions: 1,
        actualEffortReduction: 15,
        date: today,
      }),
    ])
  })

  test('trackUsage throws for unknown tool', async () => {
    const tracker = new CliTracker(aoaArgs)
    await expect(tracker.trackUsage({ toolName: 'NonExistentTool' })).rejects.toThrow('Tool not found: NonExistentTool')
  })

  test('trackUsages sends batch reports to AOA', async () => {
    const tracker = new CliTracker(aoaArgs)
    await tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' })
    const spy = vi.spyOn(tracker.aoaClient!, 'sendTrackingReport')
    await tracker.trackUsages([{ toolName: 'Commerce Migration Toolkit' }, { toolName: 'JRebel' }])
    expect(spy).toHaveBeenCalledWith([
      expect.objectContaining({ toolId: '510', actualEffortReduction: 15 }),
      expect.objectContaining({ toolId: '532', actualEffortReduction: 45 }),
    ])
  })

  test('reads AOA config from environment variables', async () => {
    const originalEnv = { ...process.env }
    process.env.AOA_CLIENT_ID = 'env-client-id'
    process.env.AOA_CLIENT_SECRET = 'env-client-secret'
    try {
      const tracker = new CliTracker({ apiKey: 'k', dataCenter: 'dc' })
      await tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' })
      expect(tracker.aoaClient).not.toBeNull()
    } finally {
      process.env = originalEnv
    }
  })

  test('AOA not initialized when credentials missing', async () => {
    const originalEnv = { ...process.env }
    delete process.env.AOA_CLIENT_ID
    delete process.env.AOA_CLIENT_SECRET
    try {
      const tracker = new CliTracker({ apiKey: 'k', dataCenter: 'dc' })
      await tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' })
      expect(tracker.aoaClient).toBeNull()
    } finally {
      process.env = originalEnv
    }
  })

  test('only initializes AOA once even with concurrent calls', async () => {
    const tracker = new CliTracker(aoaArgs)
    await Promise.all([
      tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' }),
      tracker.trackUsage({ toolName: 'JRebel' }),
      tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' }),
    ])
    expect(tracker.aoaClient).not.toBeNull()
  })
})

describe('Tracker multi-channel behavior', () => {
  const mixedArgs = {
    apiKey: 'apiKey',
    dataCenter: 'eu1',
    clientId: 'client-id',
    clientSecret: 'client-secret',
  }

  const aoaOnlyArgs = {
    clientId: 'client-id',
    clientSecret: 'client-secret',
  }

  test('CDC failure + AOA success resolves', async () => {
    const tracker = new CliTracker(mixedArgs)
    const cdcError = new Error('CDC unavailable')
    const aoaSpy = vi.fn().mockResolvedValue(undefined)

    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(true)
    vi.spyOn(tracker.account, 'setLatestUsages').mockRejectedValue(cdcError)
    vi.spyOn(tracker as any, 'ensureAOAInitialized').mockResolvedValue(true)
    tracker.aoaClient = { sendTrackingReport: aoaSpy } as any

    await expect(tracker.trackUsage({ toolName: 'JRebel' })).resolves.toBeUndefined()
    expect(aoaSpy).toHaveBeenCalledTimes(1)
  })

  test('CDC success + AOA success resolves', async () => {
    const tracker = new CliTracker(mixedArgs)
    const aoaSpy = vi.fn().mockResolvedValue(undefined)

    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(true)
    vi.spyOn(tracker.account, 'setLatestUsages').mockResolvedValue({ errorCode: 0 } as any)
    vi.spyOn(tracker as any, 'ensureAOAInitialized').mockResolvedValue(true)
    tracker.aoaClient = { sendTrackingReport: aoaSpy } as any

    await expect(tracker.trackUsage({ toolName: 'JRebel' })).resolves.toBeUndefined()
    expect(aoaSpy).toHaveBeenCalledTimes(1)
  })

  test('CDC success + AOA failure rejects', async () => {
    const tracker = new CliTracker(mixedArgs)
    const aoaError = new Error('AOA failed')

    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(true)
    vi.spyOn(tracker.account, 'setLatestUsages').mockResolvedValue({ errorCode: 0 } as any)
    vi.spyOn(tracker as any, 'ensureAOAInitialized').mockResolvedValue(true)
    tracker.aoaClient = { sendTrackingReport: vi.fn().mockRejectedValue(aoaError) } as any

    await expect(tracker.trackUsage({ toolName: 'JRebel' })).rejects.toThrow('AOA failed')
  })

  test('CDC failure + AOA failure rejects with aggregated channel details', async () => {
    const tracker = new CliTracker(mixedArgs)
    const cdcError = new Error('CDC failed')
    const aoaError = new Error('AOA failed')

    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(true)
    vi.spyOn(tracker.account, 'setLatestUsages').mockRejectedValue(cdcError)
    vi.spyOn(tracker as any, 'ensureAOAInitialized').mockResolvedValue(true)
    tracker.aoaClient = { sendTrackingReport: vi.fn().mockRejectedValue(aoaError) } as any

    await expect(tracker.trackUsage({ toolName: 'JRebel' })).rejects.toMatchObject({
      name: 'MultiChannelTrackingError',
      channelErrors: {
        CDC: 'CDC failed',
        AOA: 'AOA failed',
      },
    })
  })

  test('only CDC configured and CDC fails rejects', async () => {
    const tracker = new CliTracker({ apiKey: 'apiKey', dataCenter: 'eu1' })
    const cdcError = new Error('CDC failed')

    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(true)
    vi.spyOn(tracker.account, 'setLatestUsages').mockRejectedValue(cdcError)
    vi.spyOn(tracker as any, 'ensureAOAInitialized').mockResolvedValue(false)

    await expect(tracker.trackUsage({ toolName: 'JRebel' })).rejects.toThrow('CDC failed')
  })

  test('only AOA configured and AOA succeeds resolves', async () => {
    const tracker = new CliTracker(aoaOnlyArgs)
    const aoaSpy = vi.fn().mockResolvedValue(undefined)

    vi.spyOn(tracker as any, 'ensureAOAInitialized').mockResolvedValue(true)
    tracker.aoaClient = { sendTrackingReport: aoaSpy } as any

    await expect(tracker.trackUsage({ toolName: 'JRebel' })).resolves.toBeUndefined()
    expect(aoaSpy).toHaveBeenCalledTimes(1)
  })

  test('only AOA configured and AOA fails rejects', async () => {
    const tracker = new CliTracker(aoaOnlyArgs)
    const aoaError = new Error('AOA failed')

    vi.spyOn(tracker as any, 'ensureAOAInitialized').mockResolvedValue(true)
    tracker.aoaClient = { sendTrackingReport: vi.fn().mockRejectedValue(aoaError) } as any

    await expect(tracker.trackUsage({ toolName: 'JRebel' })).rejects.toThrow('AOA failed')
  })

  test('long CDC retries do not block AOA success', async () => {
    const tracker = new CliTracker(mixedArgs)
    const aoaSpy = vi.fn().mockResolvedValue(undefined)

    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(true)
    vi.spyOn(tracker.account, 'setLatestUsages').mockImplementation(
      () => new Promise(() => undefined),
    )
    vi.spyOn(tracker as any, 'ensureAOAInitialized').mockResolvedValue(true)
    tracker.aoaClient = { sendTrackingReport: aoaSpy } as any

    await expect(tracker.trackUsage({ toolName: 'JRebel' })).resolves.toBeUndefined()
    expect(aoaSpy).toHaveBeenCalledTimes(1)
  })
})
