/*
 * Service Worker (background script) for Chrome Extension MV3.
 * Proxies fetch requests from content scripts to bypass CORS restrictions.
 *
 * The XSUAA token endpoint does not support CORS, so content scripts cannot
 * call it directly. This service worker receives messages from content scripts
 * and executes the fetch on their behalf using the extension's host_permissions.
 */

console.debug('[AOA SW] Service worker started')

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'proxy-fetch') {
    return false
  }

  const { url, options } = message
  console.debug('[AOA SW] Proxy request received from tab:', sender.tab?.id, 'URL:', url)

  const cleanOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': options.headers?.['content-type'] || options.headers?.['Content-Type'] || 'application/json',
      Accept: options.headers?.accept || options.headers?.Accept || 'application/json',
    },
  }

  // Pass Authorization header (needed for the tracking-report request)
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
      console.debug('[AOA SW] Fetch completed:', response.status, response.statusText, 'for URL:', url)
      sendResponse({
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body,
      })
    })
    .catch((error) => {
      console.error('[AOA SW] Fetch error:', error.message, 'for URL:', url)
      sendResponse({ ok: false, status: 0, error: error.message })
    })

  return true // keep sendResponse channel open for async response
})
