import { describe, test, beforeEach, beforeAll, afterAll, expect, vi } from 'vitest'
import FileStorage from './fileStorage'
import fs from 'fs'
import * as uuid from 'uuid'

vi.mock('fs')
vi.mock('uuid')

describe('File Storage', () => {
  let storageLocation: string
  let email: string
  let consent: boolean
  let storage: FileStorage
  const toolName: string = 'tool name'
  const featureName: string = 'feature name'

  let hour: number
  let minutes: number
  let systemDate: Date

  beforeAll(() => {
    vi.useFakeTimers()
  })

  beforeEach(() => {
    vi.restoreAllMocks()

    storageLocation = 'location'
    email = 'email'
    consent = false

    setSystemTime()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  function setSystemTime(): void {
    hour = 13
    minutes = 50
    systemDate = new Date(2024, 1, 1, hour, minutes)
    vi.setSystemTime(systemDate)
  }

  function getSystemDateString(): string {
    return `2024-02-01T${hour}:${minutes}:00.000Z`
  }

  function getFileContentWithEmptyUsages() {
    return `{${getFileContentExceptUsages()},"latestUsages":[]}`
  }

  function getFileContentExceptUsages() {
    return `"location":"${storageLocation}","consentGranted":${consent},"email":"${email}"`
  }

  function getFileUsage(createdAt: string) {
    return `{"id":"id","toolName":"${toolName}","featureName":"${featureName}","createdAt":"${createdAt}"}`
  }

  test('init', () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue('')
    storage = new FileStorage(storageLocation)
    email = ''
    expect(storage.toString()).toEqual(getFileContentWithEmptyUsages())
  })

  test('set consent granted', () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue('')
    storage = new FileStorage(storageLocation)
    consent = true
    storage.setConsentGranted(consent, email)
    expect(storage.toString()).toEqual(getFileContentWithEmptyUsages())
  })

  test('is consent granted', () => {
    consent = true
    vi.spyOn(fs, 'readFileSync').mockReturnValue(btoa(getFileContentWithEmptyUsages()))
    storage = new FileStorage(storageLocation)
    expect(storage.isConsentGranted()).toBeTruthy()
  })

  test('set latest usage', () => {
    consent = true
    vi.spyOn(uuid, 'v4').mockReturnValue('id')
    vi.spyOn(fs, 'readFileSync').mockReturnValue(btoa(`{${getFileContentExceptUsages()},"latestUsages":[${getFileUsage('2020-02-01T13:58:00.000Z')}]}`))
    storage = new FileStorage(storageLocation)

    // add an old usage that will be filtered out next time
    hour -= 1
    const oldUsage = new Date(2024, 1, 1, hour, minutes)
    vi.setSystemTime(oldUsage)
    storage.setLatestUsage(toolName, featureName)
    expect(storage.toString()).toEqual(`{${getFileContentExceptUsages()},"latestUsages":[${getFileUsage(getSystemDateString())}]}`)

    // add another usage, that will be the only one as the previous was filtered out
    hour += 1
    vi.setSystemTime(systemDate)
    const firstUsageStr = getSystemDateString()
    storage.setLatestUsage(toolName, featureName)
    expect(storage.toString()).toEqual(`{${getFileContentExceptUsages()},"latestUsages":[${getFileUsage(getSystemDateString())}]}`)

    // add a second usage
    minutes += 1
    const recentUsage = new Date(2024, 1, 1, hour, minutes)
    vi.setSystemTime(recentUsage)
    storage.setLatestUsage(toolName, featureName)
    expect(storage.toString()).toEqual(`{${getFileContentExceptUsages()},"latestUsages":[` + `${getFileUsage(firstUsageStr)},` + `${getFileUsage(getSystemDateString())}` + `]}`)
  })
})
