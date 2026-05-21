/* global chrome, globalThis */

/**
 * Fetch Proxy for Chrome Extension Content Scripts.
 *
 * This module overrides window.fetch and globalThis.fetch so that requests
 * to AOA-related domains are routed through the extension's service worker
 * (which has host_permissions and is not subject to CORS).
 *
 * IMPORTANT: This file MUST be imported BEFORE the tracking tool library.
 * ES module imports are evaluated in order, so the library will capture
 * the already-overridden fetch reference during its initialization.
 */

const AOA_DOMAINS = [
  'authentication.eu10.hana.ondemand.com',
  'asc-auto-ops-tracking-api-test.cfapps.eu10-004.hana.ondemand.com',
  'asc-auto-ops-tracking-api-prod.cfapps.eu10-004.hana.ondemand.com',
]

function isAoaDomain(url) {
  try {
    const { hostname } = new URL(url)
    return AOA_DOMAINS.some((domain) => hostname.endsWith(domain))
  } catch {
    return false
  }
}

const originalFetch = window.fetch.bind(window)

function proxyFetch(url, options = {}) {
  if (!isAoaDomain(url) || typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
    return originalFetch(url, options)
  }

  const serializedOptions = {
    method: options.method,
    headers: options.headers instanceof Headers ? Object.fromEntries(options.headers.entries()) : options.headers,
    body: typeof options.body === 'string' ? options.body : options.body?.toString(),
  }

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'proxy-fetch', url, options: serializedOptions }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message))
      }
      if (!response || response.error) {
        return reject(new Error(response?.error || 'Proxy fetch failed'))
      }
      resolve(new Response(response.body, { status: response.status, statusText: response.statusText }))
    })
  })
}

window.fetch = proxyFetch
globalThis.fetch = proxyFetch
