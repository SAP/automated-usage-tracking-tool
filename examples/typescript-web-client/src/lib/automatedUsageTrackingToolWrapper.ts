import WebTracker, { TrackUsageArguments } from '@sap_oss/automated-usage-tracking-tool'

// Credentials are read from environment variables:
// AOA_CLIENT_ID, AOA_CLIENT_SECRET
// Token URL and API URL default to production. Set AOA_TOKEN_URL / AOA_API_URL to override.
// For web apps, these should be injected at build time (e.g. via webpack DefinePlugin or Angular environment files)
const trackingTool = new WebTracker()

const trackUsageArguments: TrackUsageArguments = { toolName: 'Commerce Migration Toolkit' }

export async function trackUsage() {
  return await trackingTool.trackUsage(trackUsageArguments)
}
