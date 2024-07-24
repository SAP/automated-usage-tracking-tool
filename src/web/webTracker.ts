import Tracker, { TrackerArguments } from '../common/tracker'
import WebConsent from './webConsent'
import WebStorage from './webStorage'

export default class WebTracker extends Tracker {
  constructor(trackerArguments: TrackerArguments) {
    super(trackerArguments, new WebStorage(trackerArguments.storageName ? trackerArguments.storageName : 'usageTracking'), new WebConsent())
  }
}
