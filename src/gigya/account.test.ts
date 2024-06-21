import { describe, test, beforeEach, beforeAll, afterAll, expect, vi, Mock } from 'vitest'
import Account from './account'
import { GigyaResponse } from './gigya'
import { createFetchResponse, getSiteConfigSuccessfulResponse, gigyaResponseOk } from './account.dataTest'

const gigyaResponse: GigyaResponse = Object.assign(gigyaResponseOk, {
  dataCenter: 'eu1',
  regToken: 'token',
})

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(gigyaResponse),
  }),
) as Mock
/*
global.fetch = vi.fn(() =>
    createFetchResponse(gigyaResponse)
) as Mock;
*/

describe('Account', () => {
  let account: Account
  const apiKey: string = '4_TCuGT23_GS-FxSIFf3YNdQ'

  beforeAll(() => {})

  beforeEach(() => {
    //vi.restoreAllMocks();
    account = new Account(apiKey)
  })

  afterAll(() => {})

  test('get token successfully', async () => {
    const token: string = await account.getToken()
    expect(token).toBeDefined()
    expect(token.length).toBeGreaterThan(1)
  })
})
