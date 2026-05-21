import CliTracker from '@sap_oss/automated-usage-tracking-tool'

// Credentials are read from environment variables:
// AOA_CLIENT_ID, AOA_CLIENT_SECRET
// Token URL and API URL default to production. Set AOA_TOKEN_URL / AOA_API_URL to override.
const trackingTool = new CliTracker()

export async function trackUsage(toolName) {
  return await trackingTool.trackUsage({ toolName })
}
