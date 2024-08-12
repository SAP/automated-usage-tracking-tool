import CliTracker, { ConsentArguments, TrackerArguments, TrackUsageArguments } from '@sap_oss/automated-usage-tracking-tool'
import '@sap_oss/automated-usage-tracking-tool/theme/sap_horizon.css'

const trackerArguments: TrackerArguments = { apiKey: '4_TCuGT23_GS-FxSIFf3YNdQ', dataCenter: 'eu1' }

const consentArguments: ConsentArguments = {}

const trackUsageArguments: TrackUsageArguments = { toolName: 'typescript-cli-client', featureName: 'example' }

const trackingTool = new CliTracker(trackerArguments)

export async function requestConsentConfirmation() {
  // Request anonymous consent with a custom message
  return await trackingTool.requestConsentConfirmation({
    message: `
      <h2>Application Title</h2>
      This app collects anonymous usage data to help deliver and improve this product. By installing this app, you agree to share this information with SAP. If you wish to revoke your consent, please uninstall the app. Do you want to continue?
    `,
  })
}

export async function requestConsentQuestion() {
  // Request consent for a specific email
  return await trackingTool.requestConsentQuestion({
    email: 'example@test.com',
  })
}

export async function trackUsage() {
  return await trackingTool.trackUsage(trackUsageArguments)
}
