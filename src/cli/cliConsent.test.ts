import { describe, test, expect } from 'vitest'
import mockStdin from 'mock-stdin'
import { CliConsent } from './cliConsent'

describe.skip('Cli consent', () => {
  let stdin: ReturnType<typeof mockStdin.stdin>

  test('ask consent question', async () => {
    stdin = mockStdin.stdin()
    stdin.send('Y')
    const consent: CliConsent = new CliConsent()
    const response = await consent.askConsentQuestion()
    stdin.end()

    expect(response).toBeTruthy()
  })
})
