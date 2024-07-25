import Consent from '../common/consent'
import readline from 'readline'

export default class CliConsent extends Consent {
  private cliMessage: string = `${Consent.message} (Y/n)`

  askConsentConfirm = (msg = this.cliMessage) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    return new Promise<boolean>((resolve, reject) => {
      rl.question(msg, async (response) => {
        rl.close()
        response.toUpperCase() === 'Y' ? resolve(true) : reject(false)
      })
    })
  }

  askConsentQuestion = (msg = this.cliMessage) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    return new Promise<boolean>((resolve, reject) => {
      rl.question(msg, async (response) => {
        rl.close()
        resolve(response.toUpperCase() === 'Y' ? true : false)
      })
    })
  }
}
