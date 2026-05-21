import { describe, test, expect } from 'vitest'
import CliTracker from './cliTracker'
import Tracker from '../common/tracker'

describe('CLI Tracker', () => {
  const trackerArgs = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    tokenUrl: 'https://auth.example.com/oauth/token',
    apiUrl: 'https://api.example.com',
  }
  const tracker: Tracker = new CliTracker(trackerArgs)

  test('cli tracker should be an instance of Tracker', () => {
    expect(tracker instanceof CliTracker).toBeTruthy()
    expect(tracker instanceof Tracker).toBeTruthy()
    expect(tracker.aoaClient).toBeDefined()
  })

  test('isConsentGranted always returns true', () => {
    expect(tracker.isConsentGranted()).toBe(true)
  })
})
