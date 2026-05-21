/**
 * Bridge Content Script (runs in ISOLATED world).
 *
 * Listens for 'aoa-proxy-request' messages from the page's MAIN world
 * (sent by the tracking library via window.postMessage) and forwards them
 * to the extension's service worker via chrome.runtime.sendMessage.
 *
 * The response from the service worker is relayed back to the page via
 * window.postMessage with type 'aoa-proxy-response'.
 *
 * This script must be declared in manifest.json as a content_script
 * (without "world": "MAIN") so it runs in the ISOLATED world where
 * chrome.runtime is available.
 */

console.debug('[AOA Bridge] Content script loaded on:', window.location.href)

window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.type !== 'aoa-proxy-request') {
    return
  }

  const { requestId, url, options } = event.data
  console.debug('[AOA Bridge] Received proxy request:', requestId, 'for URL:', url)

  chrome.runtime.sendMessage({ type: 'proxy-fetch', url, options }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('[AOA Bridge] chrome.runtime.sendMessage error:', chrome.runtime.lastError.message)
      window.postMessage(
        { type: 'aoa-proxy-response', requestId, ok: false, status: 0, error: chrome.runtime.lastError.message },
        '*',
      )
      return
    }

    console.debug('[AOA Bridge] Received response from service worker:', response?.status, response?.statusText)
    window.postMessage(
      { type: 'aoa-proxy-response', requestId, ...(response || { ok: false, status: 0, error: 'No response from service worker' }) },
      '*',
    )
  })
})
