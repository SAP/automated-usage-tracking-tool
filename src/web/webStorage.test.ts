import { describe, test, expect } from 'vitest'
import WebStorage from './webStorage'

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

describe('Web Storage', () => {
  setupLocalStorageMock()

  const webStorage = new WebStorage(mockLocation)

  test('should store and retrieve the consent', () => {
    const emailAddress = 'test@example.com'
    webStorage.setConsentGranted(true, emailAddress)
    expect(webStorage.isConsentGranted()).toBe(true)
  })

  test('should store and retrieve usage data', () => {
    const toolName = 'Test Tool'
    const featureName = 'Test Feature'
    webStorage.setLatestUsage(toolName, featureName)
    const latestUsages = webStorage.getLatestUsages()
    expect(latestUsages.length).toEqual(1)
    const latestUsage = latestUsages.pop()!
    expect(latestUsage.toolName).toEqual(toolName)
    expect(latestUsage.featureName).toEqual(featureName)
  })
})
