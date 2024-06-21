import Gigya from './gigya'

interface Params {
  apiKey: string
  dataCenter?: string
  [key: string]: any
}

export default class Account {
  private datacenter: string = ''

  constructor(private apiKey: string) {
    this.apiKey = apiKey
  }

  private async init() {}

  private async getDatacenter(): Promise<string> {
    if (this.datacenter === '') {
      const body: Params = { apiKey: this.apiKey }
      const response = await Gigya.getInstance().request('https://admin.us1.gigya.com/admin.getSiteConfig', body)
      if (response.errorCode === 0 && response.dataCenter) {
        this.datacenter = response.dataCenter
      }
    }
    return this.datacenter
  }

  async getToken(): Promise<string> {
    this.datacenter = await this.getDatacenter()
    const body: Params = {
      apiKey: this.apiKey,
      dataCenter: this.datacenter,
    }
    const response = await Gigya.getInstance().request(`https://accounts.${this.datacenter}.gigya.com/accounts.initRegistration`, body)
    return response.regToken ? response.regToken : ''
  }
}
