import { describe, test, expect, vi, beforeEach } from 'vitest'
import CliTracker from '../cli/cliTracker'
import WebTracker from '../web/webTracker'
import Tracker from '../common/tracker'

vi.mock('./storage')
vi.mock('../cli/fileStorage')
vi.mock('../web/webStorage')
vi.mock('../gigya/account')

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('Tracker', () => {
  const apiKey: string = 'apiKey'
  const dataCenter: string = 'eu1'
  const cliTracker: Tracker = new CliTracker({ apiKey, dataCenter })
  const webTracker: Tracker = new WebTracker({ apiKey, dataCenter })
  const email: string = 'email@domain.com'
  const toolName: string = 'tool name'

  test.each([cliTracker, webTracker])('consent is already granted', (tracker) => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(true)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    tracker.requestConsentConfirmation({})
    expect(spySetConsentGranted).not.toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('consent confirm is not granted', (tracker) => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    vi.spyOn(tracker.consent, 'askConsentConfirm').mockReturnValue(Promise.reject(false))
    expect(tracker.requestConsentConfirmation({})).rejects.toBeFalsy()
    expect(spySetConsentGranted).not.toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('consent confirm is granted', async (tracker) => {
    const consentResponse: boolean = true
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    vi.spyOn(tracker.consent, 'askConsentConfirm').mockReturnValue(Promise.resolve(consentResponse))
    await expect(tracker.requestConsentConfirmation({ email })).resolves.toBeTruthy()
    expect(spySetConsentGranted).toHaveBeenCalledWith(consentResponse, email)
    expect(spyAccount).toHaveBeenCalledWith(consentResponse, email)
  })

  test.each([cliTracker, webTracker])('consent question is not granted', (tracker) => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    vi.spyOn(tracker.consent, 'askConsentQuestion').mockReturnValue(Promise.resolve(false))
    expect(tracker.requestConsentQuestion({})).resolves.toBeFalsy()
    expect(spySetConsentGranted).not.toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('consent question is granted', async (tracker) => {
    const consentResponse: boolean = true
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    vi.spyOn(tracker.consent, 'askConsentQuestion').mockReturnValue(Promise.resolve(consentResponse))
    await expect(tracker.requestConsentQuestion({})).resolves.toBeTruthy()
    expect(spySetConsentGranted).toHaveBeenCalledWith(consentResponse, expect.stringContaining('@automated-usage-tracking-tool.sap'))
    expect(spyAccount).toHaveBeenCalledWith(consentResponse, expect.stringContaining('@automated-usage-tracking-tool.sap'))
  })

  test.each([cliTracker, webTracker])('track usage without consent', (tracker) => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetLatestUsage = vi.spyOn(tracker.storage, 'setLatestUsage')
    tracker.trackUsage({ toolName })
    expect(spySetLatestUsage).not.toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('track usage with consent', async (tracker) => {
    const featureName: string = 'feature name'
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(true)
    const spySetLatestUsage = vi.spyOn(tracker.storage, 'setLatestUsage')
    const spyAccount = vi.spyOn(tracker.account, 'setLatestUsages')
    await tracker.trackUsage({ toolName, featureName })
    expect(spySetLatestUsage).toHaveBeenCalledWith(toolName, featureName)
    expect(spyAccount).toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('track usage with provided consent question answer true', async (tracker) => {
    const featureName: string = 'feature name'
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    await expect(tracker.provideConsentQuestionAnswer({ email, message: 'yes' })).resolves.toBeTruthy()
    expect(spySetConsentGranted).toHaveBeenCalledWith(true, email)
    expect(spyAccount).toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('track usage with provided consent question answer false', async (tracker) => {
    const featureName: string = 'feature name'
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    await expect(tracker.provideConsentQuestionAnswer({ email, message: 'no' })).resolves.toBeFalsy()
    expect(spySetConsentGranted).not.toHaveBeenCalled()
    expect(spyAccount).not.toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('track usage with provided consent confirm answer true', async (tracker) => {
    const featureName: string = 'feature name'
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    await expect(tracker.provideConsentConfirmAnswer({ email, message: 'yes' })).resolves.toBeTruthy()
    expect(spySetConsentGranted).toHaveBeenCalledWith(true, email)
    expect(spyAccount).toHaveBeenCalled()
  })

  test.each([cliTracker, webTracker])('track usage with provided consent confirm answer false', async (tracker) => {
    const featureName: string = 'feature name'
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    await expect(tracker.provideConsentConfirmAnswer({ email, message: 'no' })).rejects.toBeFalsy()
    expect(spySetConsentGranted).not.toHaveBeenCalled()
    expect(spyAccount).not.toHaveBeenCalled()
  })
})
