import trackingTool, { TrackerArguments, ConsentArguments, TrackUsageArguments } from '@sap_oss/automated-usage-tracking-tool'

async function main() {
  const trackerArguments: TrackerArguments = { apiKey: '4_TCuGT23_GS-FxSIFf3YNdQ', dataCenter: 'eu1' }

  const consentArguments: ConsentArguments = {}

  const trackUsageArguments: TrackUsageArguments = { toolName: 'typescript-client', featureName: 'example' }

  trackingTool.init(trackerArguments)

  await trackingTool.requestConsentQuestion(consentArguments)

  trackingTool.requestConsentConfirmation({ message: 'This is a customized request consent confirmation message.' })

  trackingTool.trackUsage(trackUsageArguments)
}

main()
