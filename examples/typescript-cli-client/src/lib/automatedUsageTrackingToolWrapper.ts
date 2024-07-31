import CliTracker, { TrackerArguments, ConsentArguments, TrackUsageArguments } from '@sap_oss/automated-usage-tracking-tool'

const trackerArguments: TrackerArguments = { apiKey: '4_TCuGT23_GS-FxSIFf3YNdQ', dataCenter: 'eu1' }

const consentArguments: ConsentArguments = {}

const trackUsageArguments: TrackUsageArguments = { toolName: 'typescript-cli-client', featureName: 'example' }

const trackingTool = new CliTracker(trackerArguments)

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

export async function trackUsage() {
  return await trackingTool.trackUsage(trackUsageArguments)
}
