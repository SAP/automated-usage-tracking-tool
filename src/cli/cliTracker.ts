import Tracker, { TrackerArguments } from '../common/tracker'
import CliConsent from './cliConsent'
import FileStorage from './fileStorage'

export default class CliTracker extends Tracker {
  constructor(trackerArguments: TrackerArguments) {
    super(trackerArguments, new FileStorage(trackerArguments.storageName ? trackerArguments.storageName : 'usageTracking'), new CliConsent())
  }
}
