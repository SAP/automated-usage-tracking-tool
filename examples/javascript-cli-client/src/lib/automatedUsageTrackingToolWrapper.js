import CliTracker from '@sap_oss/automated-usage-tracking-tool'

// trackingTool.init({
//   apiKey: '4_TCuGT23_GS-FxSIFf3YNdQ',
//   dataCenter: 'eu1',
// })

const trackingTool = new CliTracker({
  apiKey: '4_TCuGT23_GS-FxSIFf3YNdQ',
  dataCenter: 'eu1',
})

export async function requestConsentConfirmation() {
  return await trackingTool.requestConsentConfirmation({
    message: 'This is a customized request consent confirmation message.', // generated email with customized message
  })
}

export async function requestConsentQuestion() {
  return await trackingTool.requestConsentQuestion({
    email: 'example@test.com', // specific email with default message
  })
}

export async function trackUsage({ featureName }) {
  return await trackingTool.trackUsage({
    toolName: 'javascript-cli-client',
    featureName,
  })
}
