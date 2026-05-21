import TrackingTool from '@sap_oss/automated-usage-tracking-tool'

/**
 * Initialize the tracking tool.
 *
 * Credentials are resolved automatically from localStorage (set via browser DevTools).
 * The library detects the Chrome Extension context and routes requests through
 * the bridge content script → service worker to bypass CORS.
 *
 * No fetchProxy import needed — the library handles this internally.
 */
const trackingTool = new TrackingTool()

export async function trackUsage() {
  return await trackingTool.trackUsage({
    toolName: 'Your Tool Name', // Must match a registered tool in the built-in registry
  })
}
