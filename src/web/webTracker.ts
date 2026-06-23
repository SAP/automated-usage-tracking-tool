import Tracker, { TrackerArguments } from '../common/tracker'
import WebConsent from './webConsent'
import WebStorage from './webStorage'
import WebAoaTracker from './webAoaTracker'

export default class WebTracker extends Tracker {
  constructor(trackerArguments: TrackerArguments) {
    super(trackerArguments, new WebStorage(trackerArguments.storageName ? trackerArguments.storageName : 'usageTracking'), new WebConsent(), new WebAoaTracker())
  }
}
