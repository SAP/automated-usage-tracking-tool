import { describe, test, beforeEach, beforeAll, afterAll, expect, vi, Mock } from 'vitest'
import Account from './account'
import { GigyaResponse } from './gigya'
import { gigyaResponseOk } from './account.dataTest'

const gigyaResponse: GigyaResponse = Object.assign(gigyaResponseOk, {
  regToken: 'token',
})

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(gigyaResponse),
  }),
) as Mock

describe('Account', () => {
  let account: Account
  const apiKey: string = '4_TCuGT23_GS-FxSIFf3YNdQ'
  const dataCenter: string = 'eu1'

  beforeAll(() => {})

  beforeEach(() => {
    //vi.restoreAllMocks();
    account = new Account(apiKey, dataCenter)
  })

  afterAll(() => {})

  test('get token successfully', async () => {
    const token: string = await account.getToken()
    expect(token).toBeDefined()
    expect(token.length).toBeGreaterThan(1)
  })
})
