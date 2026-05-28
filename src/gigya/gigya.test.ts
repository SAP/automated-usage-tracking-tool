import { describe, test, expect, vi, beforeEach, Mock } from 'vitest'
import Gigya, { GigyaRequestError } from './gigya'

describe('Gigya request resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('retries transient rate-limit and succeeds', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ errorCode: 403048, errorMessage: 'Api rate limit exceeded', statusCode: 429 }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ errorCode: 403048, errorMessage: 'Api rate limit exceeded', statusCode: 429 }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ errorCode: 0, statusCode: 200, regToken: 'token' }),
      }) as Mock

    const response = await Gigya.getInstance().request(
      'https://accounts.eu1.gigya.com/accounts.initRegistration',
      { apiKey: 'apiKey', isLite: 'true' },
      {
        step: 'token',
        endpoint: 'initRegistration',
        retryOptions: {
          maxRetries: 3,
          baseDelayMs: 0,
          maxDelayMs: 0,
          jitterRatio: 0,
        },
      },
    )

    expect(response.errorCode).toEqual(0)
    expect(response.regToken).toEqual('token')
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  test('fails fast with bounded retries for persistent rate-limit', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ errorCode: 403048, errorMessage: 'Api rate limit exceeded', statusCode: 429 }),
    }) as Mock

    await expect(() => Gigya.getInstance().request(
      'https://accounts.eu1.gigya.com/accounts.initRegistration',
      { apiKey: 'apiKey', isLite: 'true' },
      {
        step: 'token',
        endpoint: 'initRegistration',
        retryOptions: {
          maxRetries: 2,
          baseDelayMs: 0,
          maxDelayMs: 0,
          jitterRatio: 0,
        },
      },
    )).rejects.toMatchObject<GigyaRequestError>({
      name: 'GigyaRequestError',
      kind: 'api-error-code',
      step: 'token',
      endpoint: 'initRegistration',
      errorCode: 403048,
    })

    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  test('classifies HTML response as json-parse error without blind retries', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 502,
      statusText: 'Bad Gateway',
      headers: {
        get: () => 'text/html',
      },
      text: () => Promise.resolve('<html><body>upstream error</body></html>'),
    }) as Mock

    await expect(() => Gigya.getInstance().request(
      'https://accounts.eu1.gigya.com/accounts.initRegistration',
      { apiKey: 'apiKey', isLite: 'true' },
      {
        step: 'token',
        endpoint: 'initRegistration',
        retryOptions: {
          maxRetries: 5,
          baseDelayMs: 0,
          maxDelayMs: 0,
          jitterRatio: 0,
        },
      },
    )).rejects.toMatchObject<GigyaRequestError>({
      name: 'GigyaRequestError',
      kind: 'json-parse',
      step: 'token',
      endpoint: 'initRegistration',
      statusCode: 502,
      contentType: 'text/html',
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
