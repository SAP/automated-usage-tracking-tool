import { beforeEach, describe, expect, Mock, test, vi } from 'vitest'
import AOAClient from './aoaClient'

// We need to test aoaFetch strategies, so we'll test through AOAClient methods
// which internally call aoaFetch

describe('AOAClient', () => {
  const config = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    tokenUrl: 'https://auth.example.com/oauth/token',
    apiUrl: 'https://api.example.com',
  }

  let client: AOAClient

  beforeEach(() => {
    vi.restoreAllMocks()
    client = new AOAClient(config)
  })

  describe('getAccessToken', () => {
    test('obtains access token successfully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test-token', expires_in: 43199 }),
        }),
      ) as Mock

      const token = await client.getAccessToken()
      expect(token).toBe('test-token')
      expect(global.fetch).toHaveBeenCalledWith(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: config.clientId,
          client_secret: config.clientSecret,
          response_type: 'token',
        }),
      })
    })

    test('reuses cached token', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test-token', expires_in: 43199 }),
        }),
      ) as Mock

      await client.getAccessToken()
      await client.getAccessToken()
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    test('throws error on failed token request', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
        }),
      ) as Mock

      await expect(client.getAccessToken()).rejects.toThrow('Failed to obtain access token: 401 Unauthorized')
    })
  })

  describe('sendTrackingReport', () => {
    const trackingReport = [
      {
        toolId: '54',
        customerName: 'Acme Corp',
        customerId: 'ACME001',
        receiverCostObject: '1234567',
        receiverRegion: 'EMEA',
        executor: 'I566818',
        numberOfExecutions: 10,
        actualEffortReduction: 3.5,
        date: '2025-06-15',
      },
    ]

    test('sends tracking report successfully', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test-token', expires_in: 43199 }),
        })
        .mockResolvedValueOnce({
          status: 201,
        }) as Mock

      await expect(client.sendTrackingReport(trackingReport)).resolves.toBeUndefined()

      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(global.fetch).toHaveBeenLastCalledWith(`${config.apiUrl}/api/automations/tracking-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify(trackingReport),
      })
    })

    test('throws error on validation failure', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test-token', expires_in: 43199 }),
        })
        .mockResolvedValueOnce({
          status: 400,
          json: () =>
            Promise.resolve({
              errorMessage: 'Validation error',
              detailedErrors: [['toolId:Tool id is required']],
            }),
        }) as Mock

      await expect(client.sendTrackingReport(trackingReport)).rejects.toThrow('AOA tracking error (400): Validation error')
    })

    test('throws error on forbidden', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test-token', expires_in: 43199 }),
        })
        .mockResolvedValueOnce({
          status: 403,
          statusText: 'Forbidden',
          json: () => Promise.reject(new Error('no json')),
        }) as Mock

      await expect(client.sendTrackingReport(trackingReport)).rejects.toThrow('AOA tracking error (403): Forbidden')
    })

    test('sends batch tracking reports', async () => {
      const batchReport = [
        ...trackingReport,
        {
          toolId: '55',
          customerName: 'Customer B',
          customerId: 'CUST_B',
          receiverCostObject: '2222222',
          receiverRegion: 'AMERICAS',
          executor: 'I123456',
          numberOfExecutions: 3,
          actualEffortReduction: 1.5,
          date: '2025-06-14',
        },
      ]

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test-token', expires_in: 43199 }),
        })
        .mockResolvedValueOnce({
          status: 201,
        }) as Mock

      await expect(client.sendTrackingReport(batchReport)).resolves.toBeUndefined()
      expect(global.fetch).toHaveBeenLastCalledWith(
        `${config.apiUrl}/api/automations/tracking-report`,
        expect.objectContaining({
          body: JSON.stringify(batchReport),
        }),
      )
    })
  })

  describe('trackUsage', () => {
    function mockTokenAndReport() {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test-token', expires_in: 43199 }),
        })
        .mockResolvedValueOnce({
          status: 201,
        }) as Mock
    }

    test('builds report by toolName when no featureName is provided', async () => {
      mockTokenAndReport()

      await client.trackUsage('Commerce Upgrade Assistant')

      expect(global.fetch).toHaveBeenLastCalledWith(
        `${config.apiUrl}/api/automations/tracking-report`,
        expect.objectContaining({
          body: expect.stringContaining('"toolId":"502"'),
        }),
      )
    })

    test('builds report by featureName when provided', async () => {
      mockTokenAndReport()

      await client.trackUsage('Customer Data Cloud toolkit', 'Email Templates')

      expect(global.fetch).toHaveBeenLastCalledWith(
        `${config.apiUrl}/api/automations/tracking-report`,
        expect.objectContaining({
          body: expect.stringContaining('"toolId":"11827"'),
        }),
      )
    })

    test('falls back to toolName when featureName is not found in registry', async () => {
      mockTokenAndReport()

      await client.trackUsage('Commerce Upgrade Assistant', 'NonExistentFeature')

      expect(global.fetch).toHaveBeenLastCalledWith(
        `${config.apiUrl}/api/automations/tracking-report`,
        expect.objectContaining({
          body: expect.stringContaining('"toolId":"502"'),
        }),
      )
    })

    test('throws error when neither featureName nor toolName are found', async () => {
      await expect(client.trackUsage('NonExistentTool', 'NonExistentFeature')).rejects.toThrow(
        'Tool not found in registry: featureName=NonExistentFeature, toolName=NonExistentTool',
      )
    })

    test('throws error when toolName is not found and no featureName', async () => {
      await expect(client.trackUsage('NonExistentTool')).rejects.toThrow(
        'Tool not found in registry: toolName=NonExistentTool',
      )
    })

    test('uses correct actualEffortReduction from featureName entry', async () => {
      mockTokenAndReport()

      await client.trackUsage('Customer Data Cloud toolkit', 'Site Deployer')

      const lastCall = (global.fetch as Mock).mock.calls.at(-1)
      const body = JSON.parse(lastCall[1].body)
      expect(body[0].actualEffortReduction).toBe(1)
    })
  })

})
