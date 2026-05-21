import Web from '@sap_oss/automated-usage-tracking-tool'

// For web applications, credentials must be injected at build time.
// Use webpack DefinePlugin, Vite's define, or CRA's REACT_APP_ prefix.
//
// Option 1: Environment variables injected at build time (via DefinePlugin)
const trackingTool = new Web()

// Option 2: Explicit configuration (for frameworks like CRA that use REACT_APP_ prefix)
// const trackingTool = new Web({
//   clientId: process.env.REACT_APP_AOA_CLIENT_ID,
//   clientSecret: process.env.REACT_APP_AOA_CLIENT_SECRET,
//   apiUrl: process.env.REACT_APP_AOA_API_URL,  // optional, for testing
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
