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
    // Ensure we're in a "non-browser" environment by default (Node.js)
    // @ts-expect-error - testing
    delete globalThis.window
    // @ts-expect-error - testing
    delete globalThis.chrome
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

  describe('aoaFetch strategies', () => {
    test('uses direct fetch in server (non-browser) environment', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({ status: 201 }) as Mock

      await client.sendTrackingReport([{
        toolId: '1', customerName: 'C', customerId: 'C1',
        receiverCostObject: 'X', receiverRegion: 'EMEA',
        executor: 'I000000', numberOfExecutions: 1,
        actualEffortReduction: 1, date: '2025-01-01',
      }])

      // Direct fetch used (no proxy)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    test('uses CORS proxy when proxyUrl is configured', async () => {
      const proxyClient = new AOAClient({ ...config, proxyUrl: 'https://proxy.example.com/fetch' })

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            ok: true, status: 200, statusText: 'OK',
            body: JSON.stringify({ access_token: 'proxy-token', expires_in: 3600 }),
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ok: true, status: 201, statusText: 'Created', body: '' }),
        }) as Mock

      await proxyClient.sendTrackingReport([{
        toolId: '1', customerName: 'C', customerId: 'C1',
        receiverCostObject: 'X', receiverRegion: 'EMEA',
        executor: 'I000000', numberOfExecutions: 1,
        actualEffortReduction: 1, date: '2025-01-01',
      }])

      // Both calls go through the proxy URL
      expect(global.fetch).toHaveBeenCalledWith(
        'https://proxy.example.com/fetch',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    test('CORS proxy throws on non-OK proxy response', async () => {
      const proxyClient = new AOAClient({ ...config, proxyUrl: 'https://proxy.example.com/fetch' })

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        text: () => Promise.resolve('upstream error'),
      }) as Mock

      await expect(proxyClient.getAccessToken()).rejects.toThrow('AOA CORS proxy error (502): upstream error')
    })

    test('in browser, falls through chrome extension to direct fetch on success', async () => {
      // Simulate browser environment
      // @ts-expect-error - testing
      globalThis.window = { postMessage: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'browser-token', expires_in: 3600 }),
      }) as Mock

      const token = await client.getAccessToken()
      expect(token).toBe('browser-token')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    test('in browser with chrome extension, uses chrome.runtime.sendMessage', async () => {
      // Simulate browser + chrome extension
      // @ts-expect-error - testing
      globalThis.window = { postMessage: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }
      // @ts-expect-error - testing
      globalThis.chrome = {
        runtime: {
          sendMessage: vi.fn((_msg: unknown, cb: (r: unknown) => void) => {
            cb({
              ok: true,
              status: 200,
              statusText: 'OK',
              body: JSON.stringify({ access_token: 'chrome-token', expires_in: 3600 }),
            })
          }),
          lastError: undefined,
        },
      }

      const token = await client.getAccessToken()
      expect(token).toBe('chrome-token')
      expect(globalThis.chrome.runtime.sendMessage).toHaveBeenCalled()
      // Direct fetch should NOT have been called
      expect(global.fetch).not.toHaveBeenCalled()
    })

    test('in browser, chrome proxy fails → falls through to direct fetch', async () => {
      // @ts-expect-error - testing
      globalThis.window = { postMessage: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }
      // @ts-expect-error - testing
      globalThis.chrome = {
        runtime: {
          sendMessage: vi.fn((_msg: unknown, cb: (r: unknown) => void) => {
            // Simulate lastError
            globalThis.chrome.runtime.lastError = { message: 'Extension context invalidated' }
            cb(null)
          }),
          lastError: undefined as { message: string } | undefined,
        },
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fallback-token', expires_in: 3600 }),
      }) as Mock

      const token = await client.getAccessToken()
      expect(token).toBe('fallback-token')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    test('in browser without postMessage, direct fetch fails → throws clear error', async () => {
      // Browser environment without postMessage (no bridge available)
      // @ts-expect-error - testing
      globalThis.window = { addEventListener: vi.fn(), removeEventListener: vi.fn() }

      // Direct fetch fails with CORS error
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed to fetch (CORS)')) as Mock

      await expect(client.getAccessToken()).rejects.toThrow('All fetch strategies failed')
    })

    test('in browser, direct fetch fails → postMessage bridge succeeds', async () => {
      // @ts-expect-error - testing
      globalThis.window = {
        postMessage: vi.fn(),
        addEventListener: vi.fn((type: string, handler: (event: MessageEvent) => void) => {
          // Simulate async bridge response
          setTimeout(() => {
            handler({
              data: {
                type: 'aoa-proxy-response',
                requestId: '', // Will be matched dynamically
                ok: true,
                status: 200,
                statusText: 'OK',
                body: JSON.stringify({ access_token: 'bridge-token', expires_in: 3600 }),
              },
            } as unknown as MessageEvent)
          }, 10)
        }),
        removeEventListener: vi.fn(),
      }

      // Direct fetch fails
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('CORS error')) as Mock

      // We need to intercept the requestId — override addEventListener to capture it
      const origPostMessage = globalThis.window!.postMessage as Mock
      origPostMessage.mockImplementation((msg: { type: string; requestId: string }) => {
        if (msg.type === 'aoa-proxy-request') {
          // Trigger the handler with matching requestId
          const calls = (globalThis.window!.addEventListener as Mock).mock.calls
          const messageHandler = calls.find((c: unknown[]) => c[0] === 'message')?.[1] as (event: MessageEvent) => void
          if (messageHandler) {
            setTimeout(() => {
              messageHandler({
                data: {
                  type: 'aoa-proxy-response',
                  requestId: msg.requestId,
                  ok: true,
                  status: 200,
                  statusText: 'OK',
                  body: JSON.stringify({ access_token: 'bridge-token', expires_in: 3600 }),
                },
              } as unknown as MessageEvent)
            }, 5)
          }
        }
      })

      // Reset addEventListener to a basic mock that stores the handler
      // @ts-expect-error - testing
      globalThis.window.addEventListener = vi.fn()

      const token = await client.getAccessToken()
      expect(token).toBe('bridge-token')
    })

    test('postMessage bridge rejects on error response', async () => {
      // @ts-expect-error - testing
      globalThis.window = {
        postMessage: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }

      // Direct fetch fails
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('CORS error')) as Mock

      const origPostMessage = globalThis.window!.postMessage as Mock
      origPostMessage.mockImplementation((msg: { type: string; requestId: string }) => {
        if (msg.type === 'aoa-proxy-request') {
          const calls = (globalThis.window!.addEventListener as Mock).mock.calls
          const messageHandler = calls.find((c: unknown[]) => c[0] === 'message')?.[1] as (event: MessageEvent) => void
          if (messageHandler) {
            setTimeout(() => {
              messageHandler({
                data: {
                  type: 'aoa-proxy-response',
                  requestId: msg.requestId,
                  ok: false,
                  status: 500,
                  statusText: 'Internal Server Error',
                  body: '',
                  error: 'Bridge fetch failed',
                },
              } as unknown as MessageEvent)
            }, 5)
          }
        }
      })

      await expect(client.getAccessToken()).rejects.toThrow('All fetch strategies failed')
    })
  })
})
