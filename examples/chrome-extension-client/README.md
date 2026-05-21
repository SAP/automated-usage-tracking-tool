# Chrome Extension Client Example (Manifest V3)

This project demonstrates the integration of the automated-usage-tracking-tool with a Chrome Extension using Manifest V3.

## The CORS Problem

Chrome Extensions inject content scripts into web pages. These scripts run in the page's origin context for network requests. The AOA OAuth2 token endpoint (XSUAA) does **not** support CORS, so `fetch()` calls from a content script will be blocked by the browser.

## Solution: Built-in Service Worker Proxy

The library **automatically detects** the browser environment and routes all AOA requests through the extension's service worker. It uses two strategies (in order of priority):

1. **`chrome.runtime.sendMessage`** — if the code runs in the extension's ISOLATED content script world
2. **`window.postMessage`** — if the code runs in the page's MAIN world (most common), using a bridge content script

**No fetch proxy import or code changes are needed in the application.**

The only requirements from the extension developer are:

1. A **`background.js`** service worker that handles `proxy-fetch` messages
2. A **`bridge.js`** content script (ISOLATED world) that relays `window.postMessage` ↔ `chrome.runtime.sendMessage`
3. **`host_permissions`** in `manifest.json` for the AOA domains

```
Page (MAIN world) → library calls window.postMessage → bridge.js (ISOLATED) → chrome.runtime.sendMessage → Service Worker → actual fetch → response back
```

## Project Structure

```
├── manifest.json          # Chrome Extension manifest with host_permissions
├── background.js          # Service worker that proxies fetch requests
└── src/
    ├── bridge.js          # Content script that bridges page ↔ service worker
    └── tracker.js         # Initializes and uses the tracking tool
```

> **Note**: `fetchProxy.js` is **no longer needed** — the proxy logic is now built into the library.

## Setup

### 1. Install dependencies

```sh
npm install @sap_oss/automated-usage-tracking-tool
```

### 2. Configure credentials

Set credentials in `localStorage` from the browser console (on the target page where the extension runs):

```js
localStorage.setItem('aoaClientId', 'your-client-id')
localStorage.setItem('aoaClientSecret', 'your-client-secret')
localStorage.setItem('aoaTokenUrl', 'https://your-token-url/oauth/token')
localStorage.setItem('aoaApiUrl', 'https://your-api-url')
```

> **No code changes required when updating the library** — credentials are read from localStorage automatically.

Alternatively, credentials can be injected at build time via environment variables and Webpack's `DefinePlugin`.

### 3. Build

```sh
npm run build
```

### 4. Load in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `build/` directory

## Key Files

### manifest.json

```json
{
  "manifest_version": 3,
  "permissions": ["storage"],
  "host_permissions": [
    "https://*.authentication.eu10.hana.ondemand.com/*",
    "https://asc-auto-ops-tracking-api-test.cfapps.eu10-004.hana.ondemand.com/*",
    "https://asc-auto-ops-tracking-api-prod.cfapps.eu10-004.hana.ondemand.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://your-target-site.com/*"],
      "run_at": "document_start",
      "js": ["bridge.js"]
    }
  ]
}
```

### bridge.js (Content Script — ISOLATED world)

This script acts as a bridge between the page (MAIN world) and the service worker. It runs in the ISOLATED world where `chrome.runtime` is available.

```js
window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.type !== 'aoa-proxy-request') {
    return
  }

  const { requestId, url, options } = event.data

  chrome.runtime.sendMessage({ type: 'proxy-fetch', url, options }, (response) => {
    if (chrome.runtime.lastError) {
      window.postMessage(
        { type: 'aoa-proxy-response', requestId, ok: false, status: 0, error: chrome.runtime.lastError.message },
        '*',
      )
      return
    }
    window.postMessage(
      { type: 'aoa-proxy-response', requestId, ...(response || { ok: false, status: 0, error: 'No response' }) },
      '*',
    )
  })
})
```

### background.js (Service Worker)

```js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'proxy-fetch') {
    return false
  }

  const { url, options } = message

  const cleanOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': options.headers?.['content-type'] || options.headers?.['Content-Type'] || 'application/json',
      Accept: options.headers?.accept || options.headers?.Accept || 'application/json',
    },
  }

  // Pass Authorization header for the tracking-report request
  const authorization = options.headers?.Authorization || options.headers?.authorization
  if (authorization) {
    cleanOptions.headers.Authorization = authorization
  }

  if (options.body) {
    cleanOptions.body = options.body
  }

  fetch(url, cleanOptions)
    .then(async (response) => {
      const body = await response.text()
      sendResponse({
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body,
      })
    })
    .catch((error) => {
      sendResponse({ ok: false, status: 0, error: error.message })
    })

  return true // keep sendResponse channel open for async
})
```

### tracker.js (Content Script)

```js
import TrackingTool from '@sap_oss/automated-usage-tracking-tool'

// No fetchProxy import needed — the library handles CORS proxy automatically.
// Credentials are read from localStorage (set via browser DevTools or app bootstrap).
const trackingTool = new TrackingTool()

export async function trackUsage() {
  return await trackingTool.trackUsage({
    toolName: 'Your Tool Name',
  })
}
```

## Important Notes

1. **No import order requirements**: The fetch proxy logic is built into the library. You do not need to import any proxy file before the library.

2. **Service worker lifecycle**: The service worker may be in "inactive" state — this is normal for MV3. It wakes up automatically when `chrome.runtime.sendMessage` is called.

3. **Network tab**: Requests proxied through the service worker will NOT appear in the page's Network tab. To inspect them, go to `chrome://extensions/` → your extension → "Inspect views: service worker".

4. **Credentials in localStorage**: The credentials are stored in the page's localStorage. This is acceptable for internal tools. For publicly distributed extensions, consider using `chrome.storage` and a custom approach.

## Debugging

1. **Check console for errors**: Look for `"AOA configuration missing"` error messages
2. **Check service worker console**: `chrome://extensions/` → "Inspect views: service worker" → Console tab
3. **Verify localStorage**: Ensure `aoaClientId` and `aoaClientSecret` are set in the page's localStorage
4. **Verify host_permissions**: The domains in `manifest.json` must match the actual OAuth/API endpoints
5. **Verify background.js is loaded**: Ensure the service worker is registered and handles `proxy-fetch` messages

For full configuration details, see the [main README](../../README.md#configure-credentials).

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](../../LICENSE) file for details.
