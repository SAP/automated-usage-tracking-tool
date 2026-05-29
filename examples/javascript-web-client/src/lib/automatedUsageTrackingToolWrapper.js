import Web from '@sap_oss/automated-usage-tracking-tool'

// For web applications, credentials must be injected at build time
// (e.g. via webpack DefinePlugin — see webpack.config.js in this example).
const trackingTool = new Web()

// Alternatively, pass credentials explicitly:
// const trackingTool = new Web({
//   clientId: process.env.AOA_CLIENT_ID,
//   clientSecret: process.env.AOA_CLIENT_SECRET,
//   apiUrl: process.env.AOA_API_URL,  // optional, defaults to production
// })

// IMPORTANT: Due to CORS limitations, this will NOT work directly in the browser.
// The XSUAA token endpoint does not support CORS.
// You must use one of the following workarounds:
// 1. Backend proxy (recommended for production SPAs)
// 2. Chrome Extension service worker proxy (see chrome-extension-client example)
// 3. Development-only CORS proxy (not recommended for production)

async function trackUsageButtonClickHandler() {
  return await trackingTool.trackUsage({ toolName: 'Commerce Migration Toolkit' })
}

export default {
  trackUsageButtonClickHandler,
}
