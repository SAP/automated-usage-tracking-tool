import Web from '@sap_oss/automated-usage-tracking-tool'

const trackingTool = new Web({ apiKey: '4_3OulQC05sfcJ-D5mG6aMNg', dataCenter: 'eu1' })

async function requestConsentConfirmationButtonClickHandler() {
  // Request anonymous consent with a custom message
  return await trackingTool.requestConsentConfirmation({
    message: `
      <h2>Application Title</h2>
      This app collects anonymous usage data to help deliver and improve this product. By installing this app, you agree to share this information with SAP. If you wish to revoke your consent, please uninstall the app. Do you want to continue?
    `,
  })
}

async function requestConsentQuestionButtonClickHandler() {
  // Request consent for a specific email
  return await trackingTool.requestConsentQuestion({
    email: 'example@test.com',
  })
}

async function trackUsageButtonClickHandler() {
  return await trackingTool.trackUsage({ toolName: 'javascript-web-client', featureName: 'example' })
}

export default {
  requestConsentQuestionButtonClickHandler,
  requestConsentConfirmationButtonClickHandler,
  trackUsageButtonClickHandler,
}
