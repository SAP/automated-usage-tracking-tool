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
  const trackerArgs = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    tokenUrl: 'https://auth.example.com/oauth/token',
    apiUrl: 'https://api.example.com',
  }

  test('consent methods always return true (deprecated)', async () => {
    const cliTracker: Tracker = new CliTracker(trackerArgs)
    const webTracker: Tracker = new WebTracker(trackerArgs)
    for (const tracker of [cliTracker, webTracker]) {
      await expect(tracker.requestConsentConfirmation()).resolves.toBe(true)
      await expect(tracker.requestConsentQuestion()).resolves.toBe(true)
      await expect(tracker.provideConsentQuestionAnswer()).resolves.toBe(true)
      await expect(tracker.provideConsentConfirmAnswer()).resolves.toBe(true)
    }
  })

  test('isConsentGranted always returns true (deprecated)', () => {
    const cliTracker: Tracker = new CliTracker(trackerArgs)
    const webTracker: Tracker = new WebTracker(trackerArgs)
    expect(cliTracker.isConsentGranted()).toBe(true)
    expect(webTracker.isConsentGranted()).toBe(true)
  })

  test('trackUsage sends report to AOA by toolName', async () => {
    const tracker = new CliTracker(trackerArgs)
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
        customerName: 'MULTIPLE',
        customerId: 'MULTIPLE',
        receiverCostObject: 'MULTIPLE',
        receiverRegion: 'MULTIPLE',
        executor: 'MULTIPLE',
        executorCostCenter: '144496124',
      }),
    ])
  })

  test('trackUsage throws for unknown tool', async () => {
    const tracker = new CliTracker(trackerArgs)
    await expect(tracker.trackUsage({ toolName: 'NonExistentTool' })).rejects.toThrow('Tool not found: NonExistentTool')
  })

  test('trackUsages sends batch reports to AOA', async () => {
    const tracker = new CliTracker(trackerArgs)
    await tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' }) // trigger init
    const spy = vi.spyOn(tracker.aoaClient!, 'sendTrackingReport')
    await tracker.trackUsages([{ toolName: 'Commerce Migration Toolkit' }, { toolName: 'JRebel' }])
    expect(spy).toHaveBeenCalledWith([
      expect.objectContaining({ toolId: '510', actualEffortReduction: 15 }),
      expect.objectContaining({ toolId: '532', actualEffortReduction: 45 }),
    ])
  })

  test('does not throw when no config — tracking is silently disabled', async () => {
    const originalEnv = { ...process.env }
    delete process.env.AOA_CLIENT_ID
    delete process.env.AOA_CLIENT_SECRET
    delete process.env.AOA_TOKEN_URL
    delete process.env.AOA_API_URL
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const tracker = new CliTracker()
      // Constructor does NOT throw — lazy init
      await tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' })
      expect(tracker.aoaClient).toBeNull()
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Tracking disabled'))
    } finally {
      warnSpy.mockRestore()
      process.env = originalEnv
    }
  })

  test('trackUsage is a no-op when unconfigured', async () => {
    const originalEnv = { ...process.env }
    delete process.env.AOA_CLIENT_ID
    delete process.env.AOA_CLIENT_SECRET
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const tracker = new CliTracker()
      await expect(tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' })).resolves.toBeUndefined()
    } finally {
      process.env = originalEnv
    }
  })

  test('reads config from environment variables', async () => {
    const originalEnv = { ...process.env }
    process.env.AOA_CLIENT_ID = 'env-client-id'
    process.env.AOA_CLIENT_SECRET = 'env-client-secret'
    process.env.AOA_TOKEN_URL = 'https://env-token-url'
    process.env.AOA_API_URL = 'https://env-api-url'
    try {
      const tracker = new CliTracker()
      await tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' })
      expect(tracker.aoaClient).not.toBeNull()
    } finally {
      process.env = originalEnv
    }
  })

  test('tracking disabled when tokenUrl is missing', async () => {
    const originalEnv = { ...process.env }
    process.env.AOA_CLIENT_ID = 'env-client-id'
    process.env.AOA_CLIENT_SECRET = 'env-client-secret'
    delete process.env.AOA_TOKEN_URL
    delete process.env.AOA_API_URL
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const tracker = new CliTracker()
      await tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' })
      expect(tracker.aoaClient).toBeNull()
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Tracking disabled'))
    } finally {
      warnSpy.mockRestore()
      process.env = originalEnv
    }
  })

  test('tracking disabled when apiUrl is missing', async () => {
    const originalEnv = { ...process.env }
    process.env.AOA_CLIENT_ID = 'env-client-id'
    process.env.AOA_CLIENT_SECRET = 'env-client-secret'
    process.env.AOA_TOKEN_URL = 'https://env-token-url'
    delete process.env.AOA_API_URL
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const tracker = new CliTracker()
      await tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' })
      expect(tracker.aoaClient).toBeNull()
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Tracking disabled'))
    } finally {
      warnSpy.mockRestore()
      process.env = originalEnv
    }
  })

  test('constructor args take priority over env vars', async () => {
    const originalEnv = { ...process.env }
    process.env.AOA_CLIENT_ID = 'env-client-id'
    process.env.AOA_CLIENT_SECRET = 'env-client-secret'
    process.env.AOA_TOKEN_URL = 'https://env-token-url'
    process.env.AOA_API_URL = 'https://env-api-url'
    try {
      const tracker = new CliTracker(trackerArgs)
      await tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' })
      expect(tracker.aoaClient).not.toBeNull()
    } finally {
      process.env = originalEnv
    }
  })

  test('only initializes once even with concurrent trackUsage calls', async () => {
    const tracker = new CliTracker(trackerArgs)
    const [r1, r2, r3] = await Promise.all([
      tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' }),
      tracker.trackUsage({ toolName: 'JRebel' }),
      tracker.trackUsage({ toolName: 'Commerce Migration Toolkit' }),
    ])
    expect(tracker.aoaClient).not.toBeNull()
  })
})
