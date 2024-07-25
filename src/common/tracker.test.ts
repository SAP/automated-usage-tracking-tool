import { describe, test, expect, vi, beforeEach } from 'vitest'
import CliTracker from '../cli/cliTracker'
import Tracker from '../common/tracker'

vi.mock('./storage')
vi.mock('../cli/fileStorage')
vi.mock('../gigya/account')

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('Tracker', () => {
  const apiKey: string = 'apiKey'
  const dataCenter: string = 'eu1'
  const tracker: Tracker = new CliTracker({ apiKey, dataCenter })
  const email: string = 'email@domain.com'
  const toolName: string = 'tool name'

  test('consent is already granted', () => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(true)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    tracker.requestConsentConfirmation({})
    expect(spySetConsentGranted).not.toHaveBeenCalled()
  })

  test('consent confirm is not granted', () => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    vi.spyOn(tracker.consent, 'askConsentConfirm').mockReturnValue(Promise.reject(false))
    expect(tracker.requestConsentConfirmation({})).rejects.toBeFalsy()
    expect(spySetConsentGranted).not.toHaveBeenCalled()
  })

  test('consent confirm is granted', async () => {
    const consentResponse: boolean = true
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    vi.spyOn(tracker.consent, 'askConsentConfirm').mockReturnValue(Promise.resolve(consentResponse))
    await expect(tracker.requestConsentConfirmation({ email })).resolves.toBeTruthy()
    expect(spySetConsentGranted).toHaveBeenCalledWith(consentResponse, email)
    expect(spyAccount).toHaveBeenCalledWith(consentResponse, email)
  })

  test('consent question is not granted', () => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    vi.spyOn(tracker.consent, 'askConsentQuestion').mockReturnValue(Promise.resolve(false))
    expect(tracker.requestConsentQuestion({})).resolves.toBeFalsy()
    expect(spySetConsentGranted).not.toHaveBeenCalled()
  })

  test('consent question is granted', async () => {
    const consentResponse: boolean = true
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetConsentGranted = vi.spyOn(tracker.storage, 'setConsentGranted')
    const spyAccount = vi.spyOn(tracker.account, 'setConsent')
    vi.spyOn(tracker.consent, 'askConsentQuestion').mockReturnValue(Promise.resolve(consentResponse))
    await expect(tracker.requestConsentQuestion({})).resolves.toBeTruthy()
    expect(spySetConsentGranted).toHaveBeenCalledWith(consentResponse, expect.stringContaining('@automated-usage-tracking-tool.sap'))
    expect(spyAccount).toHaveBeenCalledWith(consentResponse, expect.stringContaining('@automated-usage-tracking-tool.sap'))
  })

  test('track usage without consent', () => {
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(false)
    const spySetLatestUsage = vi.spyOn(tracker.storage, 'setLatestUsage')
    tracker.trackUsage({ toolName })
    expect(spySetLatestUsage).not.toHaveBeenCalled()
  })

  test('track usage with consent', async () => {
    const featureName: string = 'feature name'
    vi.spyOn(tracker.storage, 'isConsentGranted').mockReturnValue(true)
    const spySetLatestUsage = vi.spyOn(tracker.storage, 'setLatestUsage')
    const spyAccount = vi.spyOn(tracker.account, 'setLatestUsages')
    await tracker.trackUsage({ toolName, featureName })
    expect(spySetLatestUsage).toHaveBeenCalledWith(toolName, featureName)
    expect(spyAccount).toHaveBeenCalled()
  })
})
