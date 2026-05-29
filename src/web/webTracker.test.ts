import { describe, test, expect } from 'vitest'
import WebTracker from './webTracker'
import WebStorage from './webStorage'
import WebConsent from './webConsent'
import Tracker from '../common/tracker'

// @vitest-environment jsdom

const mockLocation = 'location'

function setupLocalStorageMock() {
  const mock = (function () {
    const store: { [key: string]: any } = {}
    return {
      getItem: (key: string) => store[key],
      setItem: (key: string, value: any) => (store[key] = value),
    }
  })()

  Object.defineProperty(window, 'localStorage', {
    value: mock,
  })
}

describe('Web Tracker', () => {
  const apiKey: string = 'apiKey'
  const dataCenter: string = 'eu1'
  const tracker: Tracker = new WebTracker({ apiKey, dataCenter })

  test('web store and consent should have the right types', () => {
    setupLocalStorageMock()
    expect(tracker.storage instanceof WebStorage).toBeTruthy()
    expect(tracker.consent instanceof WebConsent).toBeTruthy()
    expect(tracker.apiKey).toEqual(apiKey)
    expect(tracker.dataCenter).toEqual(dataCenter)
  })
})
