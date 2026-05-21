import CliTracker, { TrackUsageArguments } from '@sap_oss/automated-usage-tracking-tool'

// Credentials are read from environment variables:
// AOA_CLIENT_ID, AOA_CLIENT_SECRET
// Token URL and API URL default to production. Set AOA_TOKEN_URL / AOA_API_URL to override.
const trackingTool = new CliTracker()

const trackUsageArguments: TrackUsageArguments = { toolName: 'Commerce Migration Toolkit' }

export async function trackUsage() {
  return await trackingTool.trackUsage(trackUsageArguments)
}
