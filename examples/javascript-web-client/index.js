import trackingTool from '@sap_oss/automated-usage-tracking-tool'

function initButtonClickHandler() {
  trackingTool.init({ apiKey: '4_TCuGT23_GS-FxSIFf3YNdQ', dataCenter: 'eu1' })
}

function requestConsentQuestionButtonClickHandler() {
  trackingTool.requestConsentQuestion()
}

function requestConsentConfirmationButtonClickHandler() {
  trackingTool.requestConsentConfirmation({ message: 'This is a customized request consent confirmation message.' })
}

function trackUsageButtonClickHandler() {
  trackingTool.trackUsage({ toolName: 'javascript-web-client', featureName: 'example' })
}

window.initButtonClickHandler = initButtonClickHandler
window.requestConsentQuestionButtonClickHandler = requestConsentQuestionButtonClickHandler
window.requestConsentConfirmationButtonClickHandler = requestConsentConfirmationButtonClickHandler
window.trackUsageButtonClickHandler = trackUsageButtonClickHandler
