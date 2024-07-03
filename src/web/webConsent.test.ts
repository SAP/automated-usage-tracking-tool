import { describe, test, beforeEach, beforeAll, afterAll, expect, vi, afterEach } from 'vitest'
import WebConsent from './webConsent'

// @vitest-environment jsdom

describe('Web Consent', () => {
  const confirmButtonId = 'automated-usage-tracking-tool-confirm-button'
  const declineButtonId = 'automated-usage-tracking-tool-decline-button'

  let webConsent: WebConsent = new WebConsent()

  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { value: () => {} })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { value: () => {} })

  beforeEach(() => {
    webConsent = new WebConsent()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  function createEvent(elementId: string, eventName: string) {
    const event = new Event(eventName)
    const element = document.getElementById(elementId)!
    element.dispatchEvent(event)
  }

  test('should create and display the consent dialogue with only confirm button and return true on click', async () => {
    const result = webConsent.askConsentConfirm()
    createEvent(confirmButtonId, 'click')
    expect(await result).toBe(true)
  })

  test('should create and display the consent dialogue with confirm and decline buttons and return true on click confirm', async () => {
    const result = webConsent.askConsentQuestion()
    createEvent(confirmButtonId, 'click')
    expect(await result).toBe(true)
  })

  test('should create and display the consent dialogue with confirm and decline buttons and return false on click decline', async () => {
    const result = webConsent.askConsentQuestion()
    createEvent(declineButtonId, 'click')
    expect(await result).toBe(false)
  })
})
