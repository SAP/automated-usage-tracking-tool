import CliTracker from '@sap_oss/automated-usage-tracking-tool'

const trackingTool = new CliTracker({
  apiKey: '4_3OulQC05sfcJ-D5mG6aMNg',
  dataCenter: 'eu1',
})

export async function requestConsentConfirmation() {
  // Request anonymous consent with a custom message
  return await trackingTool.requestConsentConfirmation({
    message: 'This is a customized request consent confirmation message.',
  })
}

export async function requestConsentQuestion() {
  // Request consent for a specific email
  return await trackingTool.requestConsentQuestion({
    email: 'example@test.com',
  })
}

export async function trackUsage({ featureName }) {
  return await trackingTool.trackUsage({
    toolName: 'javascript-cli-client',
    featureName,
  })
}
