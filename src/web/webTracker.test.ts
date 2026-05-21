import { describe, test, expect } from 'vitest'
import WebTracker from './webTracker'
import Tracker from '../common/tracker'

describe('Web Tracker', () => {
  const trackerArgs = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    tokenUrl: 'https://auth.example.com/oauth/token',
    apiUrl: 'https://api.example.com',
  }
  const tracker: Tracker = new WebTracker(trackerArgs)

  test('web tracker should be an instance of Tracker', () => {
    expect(tracker instanceof WebTracker).toBeTruthy()
    expect(tracker instanceof Tracker).toBeTruthy()
    expect(tracker.aoaClient).toBeDefined()
  })

  test('isConsentGranted always returns true', () => {
    expect(tracker.isConsentGranted()).toBe(true)
  })
})
