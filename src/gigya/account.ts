import Gigya from './gigya'

interface Params {
  apiKey: string
  dataCenter: string
  [key: string]: any
}

export default class Account {
  constructor(
    private apiKey: string,
    private datacenter: string,
  ) {
    this.apiKey = apiKey
    this.datacenter = datacenter
  }

  async getToken(): Promise<string> {
    const body: Params = {
      apiKey: this.apiKey,
      dataCenter: this.datacenter,
    }
    const response = await Gigya.getInstance().request(`https://accounts.${this.datacenter}.gigya.com/accounts.initRegistration`, body)
    return response.regToken ? response.regToken : ''
  }
}
