import Web from '@sap_oss/automated-usage-tracking-tool'

const trackingTool = new Web({ apiKey: '4_TCuGT23_GS-FxSIFf3YNdQ', dataCenter: 'eu1' })

async function requestConsentQuestionButtonClickHandler() {
  await trackingTool.requestConsentQuestion()
}

async function requestConsentConfirmationButtonClickHandler() {
  await trackingTool.requestConsentConfirmation({ message: 'This is a customized request consent confirmation message.' })
}

async function trackUsageButtonClickHandler() {
  await trackingTool.trackUsage({ toolName: 'javascript-web-client', featureName: 'example' })
}

export default {
  requestConsentQuestionButtonClickHandler,
  requestConsentConfirmationButtonClickHandler,
  trackUsageButtonClickHandler,
}
