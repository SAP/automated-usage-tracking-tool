import Usage from '../common/usage'
import Gigya, { GigyaResponse } from './gigya'

interface Params {
  apiKey: string
  [key: string]: any
}

export default class Account {
  token: string
  constructor(
    private apiKey: string,
    private dataCenter: string,
  ) {
    this.apiKey = apiKey
    this.dataCenter = dataCenter
    this.token = ''
  }

  async getToken(): Promise<string> {
    const body: Params = {
      apiKey: this.apiKey,
      isLite: true,
    }
    const response = await Gigya.getInstance().request(`https://accounts.${this.dataCenter}.gigya.com/accounts.initRegistration`, body)
    if (response.errorCode !== 0 || !response.regToken) {
      return Promise.reject(new Error('Error getting token. ' + (response.errorDetails ? response.errorDetails : response.errorMessage)))
    }
    this.token = response.regToken
    return response.regToken
  }

  async setConsent(consent: boolean, email: string): Promise<GigyaResponse> {
    if (!this.token.length) {
      this.token = await this.getToken()
    }

    const body: Params = {
      apiKey: this.apiKey,
      regToken: this.token,
    }
    body.profile = JSON.stringify({ email: email })
    body.preferences = JSON.stringify({
      terms: {
        usageAnalytics: {
          isConsentGranted: consent,
        },
      },
    })

    let response = await Gigya.getInstance().request(`https://accounts.${this.dataCenter}.gigya.com/accounts.setAccountInfo`, body)
    if (response.errorCode === 400006) {
      // token expired
      this.token = ''
      response = await this.setConsent(consent, email)
    } else if (response.errorCode !== 0) {
      return Promise.reject(new Error('Error setting consent. ' + (response.errorDetails ? response.errorDetails : response.errorMessage)))
    }
    return response
  }

  async setLatestUsages(email: string, usages: Usage[]): Promise<GigyaResponse> {
    if (!this.token.length) {
      this.token = await this.getToken()
    }
    const body: Params = {
      apiKey: this.apiKey,
      profile: JSON.stringify({
        email: email,
      }),
      regToken: this.token,
    }
    body.data = JSON.stringify({ latestUsages: usages })

    let response = await Gigya.getInstance().request(`https://accounts.${this.dataCenter}.gigya.com/accounts.setAccountInfo`, body)
    if (response.errorCode === 400006) {
      // token expired
      this.token = ''
      response = await this.setLatestUsages(email, usages)
    } else if (response.errorCode !== 0) {
      return Promise.reject(new Error('Error setting latest usages. ' + (response.errorDetails ? response.errorDetails : response.errorMessage)))
    }
    return response
  }
}
