import { describe, test, expect } from 'vitest'
import CliTracker from './cliTracker'
import FileStorage from './fileStorage'
import CliConsent from './cliConsent'
import Tracker from '../common/tracker'

describe('CLI Tracker', () => {
  const apiKey: string = 'apiKey'
  const dataCenter: string = 'eu1'
  const tracker: Tracker = new CliTracker({ apiKey, dataCenter })

  test('cli store and consent should have the right types', () => {
    expect(tracker.storage instanceof FileStorage).toBeTruthy()
    expect(tracker.consent instanceof CliConsent).toBeTruthy()
    expect(tracker.apiKey).toEqual(apiKey)
    expect(tracker.dataCenter).toEqual(dataCenter)
  })
})
