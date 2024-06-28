import { describe, test, beforeEach, expect, vi, Mock } from 'vitest'
import Account from './account'
import Gigya, { GigyaResponse } from './gigya'
import { gigyaResponseMissingRequiredParameter, gigyaResponseOk, gigyaResponseTokenExpired } from './account.dataTest'
import Usage from '../common/usage'

describe('Account', () => {
  const apiKey: string = 'apiKey'
  const dataCenter: string = 'eu1'
  const toolName: string = 'tool name'
  const featureName: string = 'feature name'
  const token: string = 'token'
  let account: Account = new Account(apiKey, dataCenter)
  const email: string = 'email@test.com'
  const consent: boolean = true
  const gigyaTokenResponse: GigyaResponse = Object.assign({ regToken: token }, gigyaResponseOk)
  const gigyaSetAccountInfoResponse: GigyaResponse = Object.assign({ UID: '1abc234n4dwdsdsaf' }, gigyaResponseOk)
  let spy: any

  beforeEach(() => {
    spy = vi.spyOn(Gigya.getInstance(), 'request')
  })

  test('get token successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(gigyaTokenResponse),
      }),
    ) as Mock
    const token: string = await account.getToken()
    console.log(token)
    expect(token).toBeDefined()
    expect(token.length).toBeGreaterThan(1)
  })

  test('get token unsuccessfully with exception', async () => {
    global.fetch = vi.fn(() => Promise.reject('Error getting token. ')) as Mock
    await expect(() => account.getToken()).rejects.toThrowError(/^Error getting token./)
  })

  test('get token unsuccessfully with error response', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(gigyaResponseMissingRequiredParameter),
      }),
    ) as Mock
    await expect(() => account.getToken()).rejects.toThrowError(/^Error getting token./)
  })

  test('set consent successfully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => {
        return Promise.resolve(gigyaSetAccountInfoResponse)
      },
    }) as Mock

    const response: GigyaResponse = await account.setConsent(consent, email)
    expect(response).toBeDefined()
    expect(response.errorCode).toEqual(0)
    expect(response.UID).toBeDefined()

    const expectedBody = {
      apiKey: apiKey,
      profile: JSON.stringify({
        email: email,
      }),
      regToken: token,
      preferences: JSON.stringify({
        terms: {
          usageAnalytics: {
            isConsentGranted: true,
          },
        },
      }),
    }
    expect(spy).toHaveBeenCalledWith(`https://accounts.${dataCenter}.gigya.com/accounts.setAccountInfo`, expectedBody)
  })

  test('refresh token', async () => {
    account.token = 'token'
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        json: () => {
          return Promise.resolve(gigyaResponseTokenExpired)
        },
      })
      .mockResolvedValueOnce({
        json: () => {
          return Promise.resolve(gigyaTokenResponse)
        },
      })
      .mockResolvedValueOnce({
        json: () => {
          return Promise.resolve(gigyaSetAccountInfoResponse)
        },
      }) as Mock

    const response: GigyaResponse = await account.setConsent(consent, email)
    console.log(response)
    expect(response).toBeDefined()
    expect(response.errorCode).toEqual(0)
    expect(response.UID).toBeDefined()
  })

  test('set consent unsuccessfully with exception', async () => {
    global.fetch = vi.fn(() => Promise.reject('Error setting consent. ')) as Mock
    await expect(() => account.setConsent(consent, email)).rejects.toThrowError(/^Error setting consent./)
  })

  test('set consent unsuccessfully with error response', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(gigyaResponseMissingRequiredParameter),
      }),
    ) as Mock
    await expect(() => account.setConsent(consent, email)).rejects.toThrowError(/^Error setting consent./)
  })

  test('set latest usages successfully', async () => {
    const usages: Usage[] = [new Usage(toolName, featureName), new Usage(toolName)]
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => {
        return Promise.resolve(gigyaSetAccountInfoResponse)
      },
    }) as Mock

    const response: GigyaResponse = await account.setLatestUsages(email, usages)
    console.log(response)
    expect(response).toBeDefined()
    expect(response.errorCode).toEqual(0)
    expect(response.UID).toBeDefined()
    const expectedBody = {
      apiKey: apiKey,
      profile: JSON.stringify({
        email: email,
      }),
      regToken: token,
      data: JSON.stringify({
        latestUsages: usages,
      }),
    }
    expect(spy).toHaveBeenCalledWith(`https://accounts.${dataCenter}.gigya.com/accounts.setAccountInfo`, expectedBody)
  })

  test('set latest usages unsuccessfully', async () => {
    global.fetch = vi.fn(() => Promise.reject('Error setting latest usages. ')) as Mock
    await expect(() => account.setLatestUsages(email, [])).rejects.toThrowError(/^Error setting latest usages./)
  })
})
