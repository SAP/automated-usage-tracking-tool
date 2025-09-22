import { describe, test, expect } from 'vitest'
import WebConsent from '../web/webConsent'

describe('Consent', () => {
  test('should return the provided question answer false', async () => {
    let webConsent: WebConsent = new WebConsent()
    expect(await webConsent.provideConsentQuestionAnswer('no')).toBeFalsy()
    expect(await webConsent.provideConsentQuestionAnswer('No')).toBeFalsy()
    expect(await webConsent.provideConsentQuestionAnswer('fAlSe')).toBeFalsy()
    expect(await webConsent.provideConsentQuestionAnswer('1')).toBeFalsy()
    expect(await webConsent.provideConsentQuestionAnswer('0')).toBeFalsy()
    expect(await webConsent.provideConsentQuestionAnswer('')).toBeFalsy()
    expect(await webConsent.provideConsentQuestionAnswer(undefined)).toBeFalsy()
  })

  test('should return the provided question answer yes', async () => {
    let webConsent: WebConsent = new WebConsent()
    expect(await webConsent.provideConsentQuestionAnswer('yes')).toBeTruthy()
    expect(await webConsent.provideConsentQuestionAnswer('YeS')).toBeTruthy()
    expect(await webConsent.provideConsentQuestionAnswer('y')).toBeTruthy()
    expect(await webConsent.provideConsentQuestionAnswer('Y')).toBeTruthy()
  })
})
