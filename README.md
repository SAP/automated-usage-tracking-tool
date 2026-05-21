[![REUSE status](https://api.reuse.software/badge/github.com/SAP/automated-usage-tracking-tool)](https://api.reuse.software/info/github.com/SAP/automated-usage-tracking-tool)

# Automated Usage Tracking Tool

## About this project

The Automated Usage Tracking Tool is designed to help developers track automation usage within their JavaScript and TypeScript applications using the [AOA (Automation Operations Analytics)](https://aoa-prod.cfapps.eu10-004.hana.ondemand.com) platform via OAuth2 API.

By integrating this tool, you can automatically report automation executions and effort reduction metrics to AOA, providing valuable insights into automation adoption and effectiveness.

### Key features

- **Automatic Data Population**: Tool ID, effort reduction, and execution count are automatically resolved from the tool name via a built-in registry.
- **Zero-Code Configuration**: OAuth2 credentials are resolved automatically from `localStorage` (web) or environment variables (CLI) — no code changes needed when updating the library.
- **Minimal Integration**: Users only need to provide the `toolName` — everything else is handled automatically.
- **Web and CLI Support**: The tool supports both web and command-line interface (CLI) applications.
- **Batch Tracking**: Send multiple tracking reports in a single API call with `trackUsages()`.

## Requirements and Setup

- **Node.js**: Ensure you are using Node.js version 19 or higher.
- **AOA Credentials**: Obtain OAuth2 credentials (client ID and client secret) by contacting AIGNITEUserSupport@global.corp.sap.

This tool is ready to use by JavaScript/Typescript client applications after importing and installing it from NPM.

### Create a new project

```sh
npm init
```

### Install package

Install @sap_oss/automated-usage-tracking-tool as a dependency of the new project

```sh
npm install @sap_oss/automated-usage-tracking-tool
```

### Configure credentials

The library resolves credentials automatically using the following priority order:

1. **Constructor arguments** (explicit, highest priority)
2. **`chrome.storage.local`** (Chrome Extensions — private, persistent, works across all domains)
3. **`localStorage`** (web applications — shared with the page)
4. **Environment variables** (CLI / Node.js applications)

> **All four fields are required**: `clientId`, `clientSecret`, `tokenUrl`, and `apiUrl`. If any is missing, tracking is silently disabled.

> **Note**: Configuration is resolved lazily on the first `trackUsage()` call, not at construction time. This means credentials can be set after the tracker is instantiated.

This means you can configure credentials **without changing any code** — simply set the values in the appropriate location for your environment.

---

#### Option A: chrome.storage.local (recommended for Chrome Extensions)

For Chrome Extensions with the `"storage"` permission, credentials can be stored in the extension's private storage. Set once, works across all domains:

```js
// From within the extension context (content script, popup, or service worker):
chrome.storage.local.set({
  aoaClientId: 'your-client-id',
  aoaClientSecret: 'your-client-secret',
  aoaTokenUrl: 'https://your-token-url/oauth/token',
  aoaApiUrl: 'https://your-api-url',
})
```

> **Advantage**: Private to the extension (not accessible by page scripts), persists across all domains the extension runs on.

---

#### Option B: localStorage (recommended for web applications)

Set the following keys in your browser's localStorage. This can be done once via the browser console or programmatically:

```js
localStorage.setItem('aoaClientId', 'your-client-id')
localStorage.setItem('aoaClientSecret', 'your-client-secret')
localStorage.setItem('aoaTokenUrl', 'https://your-token-url/oauth/token')
localStorage.setItem('aoaApiUrl', 'https://your-api-url')
```

> **Advantage**: When you update the library version, no code changes are required — the credentials are already in localStorage.
> 
> **Note**: localStorage is per-domain. If your extension runs on multiple domains, you need to set values on each one. Prefer `chrome.storage.local` for extensions.

---

#### Option C: Environment variables (recommended for CLI / Node.js)

Set the following environment variables with your AOA OAuth2 credentials (provided via SAP PassVault):

```sh
export AOA_CLIENT_ID="your-client-id"
export AOA_CLIENT_SECRET="your-client-secret"
export AOA_TOKEN_URL="https://your-token-url/oauth/token"
export AOA_API_URL="https://your-api-url"
```

Or create a `.env` file in your project root:

```
AOA_CLIENT_ID=your-client-id
AOA_CLIENT_SECRET=your-client-secret
AOA_TOKEN_URL=https://your-token-url/oauth/token
AOA_API_URL=https://your-api-url
```

> **Note on special characters**: Some credentials may contain special characters (`$`, `!`, `=`) that can be interpreted differently depending on your configuration method:
> - **Shell exports**: Use single quotes to prevent expansion: `export AOA_CLIENT_SECRET='my-secret$value'`
> - **`.env` files**: Behaviour depends on the dotenv implementation. Some (e.g. Node.js `dotenv`) support single quotes; others (e.g. Create React App's built-in dotenv) may require escaping with a backslash: `my-secret\$value`
> - **CI/CD, Docker, secret managers, etc.**: Refer to their respective documentation for escaping rules
>
> This is only relevant if your credentials contain these characters. Most setups will work without any special handling.

---

---

#### Option D: CORS Proxy URL (advanced)

If you have a dedicated CORS proxy server, you can configure the library to route all AOA requests through it:

| Method | Key |
|--------|-----|
| chrome.storage.local | `aoaProxyUrl` |
| localStorage | `aoaProxyUrl` |
| Environment variables | `AOA_PROXY_URL` |
| Constructor | `proxyUrl` |

> **⚠️ Important**: If `aoaProxyUrl` is set, it takes **highest priority** — the library will skip all other strategies (service worker, direct fetch) and go directly to the proxy. Only set this if you have a dedicated proxy server deployed.

The proxy must accept `POST` with JSON body:

```json
{
  "url": "https://original-aoa-url/...",
  "method": "POST",
  "headers": { "Content-Type": "...", "Authorization": "..." },
  "body": "..."
}
```

And respond with:

```json
{
  "ok": true,
  "status": 200,
  "statusText": "OK",
  "body": "..."
}
```

### Import the package

Import the default artifact

```js
import TrackingTool from '@sap_oss/automated-usage-tracking-tool'
```

### Initialize the tracker

If credentials are already configured via localStorage or environment variables, no arguments are needed:

```js
const trackingTool = new TrackingTool()
```

> **No code changes required on library update** — as long as credentials are set in localStorage (web) or environment variables (CLI), the tracker initializes automatically.

Or with explicit configuration (highest priority, overrides localStorage and environment variables):

```js
const trackingTool = new TrackingTool({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  tokenUrl: 'https://your-token-url/oauth/token',
  apiUrl: 'https://your-api-url',
})
```

### Track Usages

Track usages of your automation tool. The tool name must match one of the registered tools in the built-in registry.

```js
await trackingTool.trackUsage({ toolName: 'JRebel' })
```

> **Important**: The `toolName` must match exactly one of the tools registered in the library's built-in registry. If the tool is not registered, a `"Tool not found"` error will be thrown. To register a new tool, contact AIGNITEUserSupport@global.corp.sap.

All required AOA fields (toolId, customerName, customerId, receiverCostObject, receiverRegion, executor, executorCostCenter, numberOfExecutions, actualEffortReduction, date) are automatically populated.

#### Batch Tracking

Send multiple tracking reports in a single API call:

```js
await trackingTool.trackUsages([
  { toolName: 'JRebel' },
  { toolName: 'Commerce Migration Toolkit' },
])
```

### Types

Types are available for Typescript client applications.

```js
import { TrackerArguments, TrackUsageArguments } from '@sap_oss/automated-usage-tracking-tool'
```

### Browser / CORS Limitations

> ⚠️ **Important**: The OAuth2 `client_credentials` flow uses a token endpoint (XSUAA) that **does not support CORS**. This means direct usage from browser-based applications (SPAs, browser extensions) will fail with a CORS error when trying to obtain the access token.

The library implements a **fallback chain** that automatically tries multiple strategies in order:

```
1. Configured proxyUrl     → CORS proxy server (if aoaProxyUrl is set)
2. chrome.runtime.sendMessage → Extension service worker (if available)
3. Direct fetch            → Works in Node.js or if CORS headers are present
4. postMessage bridge      → Extension bridge content script (if available)
5. Error                   → Clear message with solutions
```

**Solutions (in order of preference):**

1. **Chrome Extension with service worker** (recommended): Add a `background.js` service worker with `host_permissions` to your extension's manifest. The library automatically detects `chrome.runtime.sendMessage` and routes requests through the service worker. See [Chrome Extension Setup](#chrome-extension-setup) below.

2. **CORS Proxy URL**: Deploy a CORS-enabled proxy server and set `aoaProxyUrl`. See [Option D: CORS Proxy URL](#option-d-cors-proxy-url-advanced) above.

3. **Backend / CLI**: Use the library in a Node.js environment where CORS does not apply.

---

#### Chrome Extension Setup

To use the library in a Chrome Extension (Manifest V3), add the following to your `manifest.json`:

```json
{
  "host_permissions": [
    "https://sapit-crossfunctions-test-manx.authentication.eu10.hana.ondemand.com/*",
    "https://asc-auto-ops-tracking-api-test.cfapps.eu10-004.hana.ondemand.com/*",
    "https://asc-auto-ops-tracking-api-prod.cfapps.eu10-004.hana.ondemand.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  }
}
```

And create a `background.js` file:

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'proxy-fetch') return false
  fetch(message.url, message.options)
    .then(async (res) => {
      const body = await res.text()
      sendResponse({ ok: res.ok, status: res.status, statusText: res.statusText, body })
    })
    .catch((err) => sendResponse({ error: err.message }))
  return true // keep channel open for async response
})
```

Credentials can be stored in `chrome.storage.local` (see [Option A](#option-a-chromestoragelocal-recommended-for-chrome-extensions)) or `localStorage` (see [Option B](#option-b-localstorage-recommended-for-web-applications)).

> **How it works**: The content script calls `chrome.runtime.sendMessage({ type: 'proxy-fetch', url, options })`. The service worker makes the actual HTTP request (no CORS restrictions) and returns the response. The library handles this automatically — no code changes needed in your application logic.

### Migration from previous version

If you are migrating from the previous Gigya-based version:

1. **Replace constructor arguments**: Change `{ apiKey, dataCenter }` to localStorage keys (`aoaClientId`, `aoaClientSecret`), environment variables (`AOA_CLIENT_ID`, `AOA_CLIENT_SECRET`), or pass them explicitly as `{ clientId, clientSecret }`.
2. **Update trackUsage calls**: Change `{ toolName, featureName }` to `{ toolName }` using the registered tool name. The `toolName` must match exactly one of the tools in the built-in registry.
3. **Remove consent calls**: `requestConsentConfirmation()`, `requestConsentQuestion()`, etc. still work but are no-ops (always return `true`). They can be safely removed.
4. **Remove hardcoded credentials**: You can now remove credentials from your code entirely and use localStorage (web) or environment variables (CLI) instead.
5. **Handle CORS**: If your application runs in the browser, you will need a proxy solution (see [Browser / CORS Limitations](#browser--cors-limitations) above). The previous Gigya-based API supported CORS; the new AOA/XSUAA endpoint does not.

## Usage Examples

In the `/examples` folder there are available examples of Javascript and Typescript Web and CLI client apps using the tool.

### JavaScript CLI Client

This example demonstrates the integration with a JavaScript CLI client application. See [examples/javascript-cli-client/README.md](examples/javascript-cli-client/README.md) for more details.

### JavaScript Web Client

This example demonstrates the integration with a JavaScript web client application using Webpack. See [examples/javascript-web-client/README.md](examples/javascript-web-client/README.md) for more details.

### TypeScript CLI Client

This example demonstrates the integration with a TypeScript CLI client application. See [examples/typescript-cli-client/README.md](examples/typescript-cli-client/README.md) for more details.

### TypeScript Web Client (Angular)

This example demonstrates the integration with a TypeScript web client application. See [examples/typescript-web-client/README.md](examples/typescript-web-client/README.md) for more details.

### Chrome Extension Client (Manifest V3)

This example demonstrates the integration with a Chrome Extension using Manifest V3, including a service worker proxy to bypass CORS limitations. See [examples/chrome-extension-client/README.md](examples/chrome-extension-client/README.md) for more details.

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/SAP/automated-usage-tracking-tool/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Security / Disclosure

If you find any bug that may be a security problem, please follow our instructions at [in our security policy](https://github.com/SAP/automated-usage-tracking-tool/security/policy) on how to report it. Please do not create GitHub issues for security-related doubts or problems.

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](https://github.com/SAP/.github/blob/main/CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2024 SAP SE or an SAP affiliate company and automated-usage-tracking-tool contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/automated-usage-tracking-tool).