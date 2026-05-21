// IMPORTANT: Import fetchProxy BEFORE the tracking tool library.
// This ensures the fetch override is in place before the library captures a reference to fetch.
import './fetchProxy'
import TrackingTool from '@sap_oss/automated-usage-tracking-tool'

/**
 * Initialize the tracking tool with credentials injected at build time.
 *
 * For Create React App (CRA), use REACT_APP_ prefix:
 *   REACT_APP_AOA_CLIENT_ID, REACT_APP_AOA_CLIENT_SECRET, REACT_APP_AOA_API_URL
 *
 * For Webpack DefinePlugin:
 *   AOA_CLIENT_ID, AOA_CLIENT_SECRET, AOA_API_URL
 *
 * For Vite:
 *   VITE_AOA_CLIENT_ID, VITE_AOA_CLIENT_SECRET, VITE_AOA_API_URL
 */
const initTracker = () => {
  const clientId = process.env.REACT_APP_AOA_CLIENT_ID
  const clientSecret = process.env.REACT_APP_AOA_CLIENT_SECRET
  const apiUrl = process.env.REACT_APP_AOA_API_URL

  if (!clientId || !clientSecret) {
    console.log('Tracking tool was not initialized due to missing AOA credentials.')
    return null
  }

  try {
    return new TrackingTool({ clientId, clientSecret, ...(apiUrl && { apiUrl }) })
  } catch (error) {
    console.log('Tracking tool was not initialized:', error.message)
    return null
  }
}

const trackingTool = initTracker()

export async function trackUsage() {
  if (!trackingTool) {
    return null
  }
  return await trackingTool.trackUsage({
    toolName: 'Your Tool Name', // Must match a registered tool in the built-in registry
  })
}
