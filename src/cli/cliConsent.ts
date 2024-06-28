import Consent from '../common/consent'
import readline from 'readline'

export class CliConsent extends Consent {
  askConsentConfirm = (msg = Consent.message) => {
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

  askConsentQuestion = (msg = Consent.message) => {
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
