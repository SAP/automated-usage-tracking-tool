import Tracker from './cli/cliTracker'
import { ConsentType } from './common/consent'

async function main() {
  console.log('cli app called ')
  const tracker: Tracker = new Tracker('4_TCuGT23_GS-FxSIFf3YNdQ', '/tmp/usageTracking')
  const consent: boolean = await tracker.requestConsent(ConsentType.QUESTION)
  if (!consent) {
    throw new Error('Program aborted because the consent was rejected')
  }
  tracker.trackUsage('cdc-toolkit')
}

main()
