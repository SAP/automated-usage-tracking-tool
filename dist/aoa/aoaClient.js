"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function isChromeExtension() {
    var _a;
    return typeof chrome !== 'undefined' && !!((_a = chrome.runtime) === null || _a === void 0 ? void 0 : _a.sendMessage);
}
function isBrowserWithPostMessage() {
    return typeof window !== 'undefined' && !!window && typeof window.postMessage === 'function';
}
function serializeHeaders(options) {
    if (options.headers instanceof Headers) {
        const headers = {};
        options.headers.forEach((value, key) => {
            headers[key] = value;
        });
        return headers;
    }
    return options.headers;
}
function chromeProxyFetch(url, options = {}) {
    var _a;
    console.debug('[AOA] Using chrome.runtime.sendMessage proxy for:', url);
    const serializedOptions = {
        method: options.method,
        headers: serializeHeaders(options),
        body: typeof options.body === 'string' ? options.body : (_a = options.body) === null || _a === void 0 ? void 0 : _a.toString(),
    };
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'proxy-fetch', url, options: serializedOptions }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('[AOA] chrome.runtime.sendMessage error:', chrome.runtime.lastError.message);
                return reject(new Error(chrome.runtime.lastError.message));
            }
            const res = response;
            if (!res || res.error) {
                console.error('[AOA] Proxy response error:', (res === null || res === void 0 ? void 0 : res.error) || 'No response');
                return reject(new Error((res === null || res === void 0 ? void 0 : res.error) || 'Proxy fetch failed'));
            }
            console.debug('[AOA] Proxy response received:', res.status, res.statusText);
            resolve(new Response(res.body, { status: res.status, statusText: res.statusText }));
        });
    });
}
function postMessageProxyFetch(url, options = {}) {
    var _a;
    const requestId = `aoa-fetch-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    console.debug('[AOA] Using window.postMessage proxy for:', url, '(requestId:', requestId, ')');
    const serializedOptions = {
        method: options.method,
        headers: serializeHeaders(options),
        body: typeof options.body === 'string' ? options.body : (_a = options.body) === null || _a === void 0 ? void 0 : _a.toString(),
    };
    return new Promise((resolve, reject) => {
        const w = window;
        const timeout = setTimeout(() => {
            w.removeEventListener('message', handler);
            console.error('[AOA] Proxy timeout: no bridge content script responded after 30s. Ensure the extension is installed, the manifest content_scripts "matches" includes this page URL, and the page was reloaded after installing the extension.');
            reject(new Error('AOA proxy fetch timeout: no bridge content script responded. Ensure the extension is installed and the page was reloaded.'));
        }, 30000);
        function handler(event) {
            var _a, _b;
            if (((_a = event.data) === null || _a === void 0 ? void 0 : _a.type) !== 'aoa-proxy-response' || ((_b = event.data) === null || _b === void 0 ? void 0 : _b.requestId) !== requestId) {
                return;
            }
            w.removeEventListener('message', handler);
            clearTimeout(timeout);
            const res = event.data;
            if (!res.ok && res.error) {
                console.error('[AOA] Bridge proxy error:', res.error);
                return reject(new Error(res.error));
            }
            console.debug('[AOA] Bridge proxy response received:', res.status, res.statusText);
            resolve(new Response(res.body, { status: res.status, statusText: res.statusText }));
        }
        w.addEventListener('message', handler);
        w.postMessage({ type: 'aoa-proxy-request', requestId, url, options: serializedOptions }, '*');
    });
}
function corsProxyFetch(proxyUrl, url, options = {}) {
    var _a;
    console.debug('[AOA] Using CORS proxy for:', url, '→', proxyUrl);
    const body = JSON.stringify({
        url,
        method: options.method || 'GET',
        headers: serializeHeaders(options),
        body: typeof options.body === 'string' ? options.body : (_a = options.body) === null || _a === void 0 ? void 0 : _a.toString(),
    });
    return fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
    }).then((proxyResponse) => __awaiter(this, void 0, void 0, function* () {
        if (!proxyResponse.ok) {
            const errorText = yield proxyResponse.text().catch(() => proxyResponse.statusText);
            throw new Error(`AOA CORS proxy error (${proxyResponse.status}): ${errorText}`);
        }
        const data = yield proxyResponse.json();
        console.debug('[AOA] CORS proxy response:', data.status, data.statusText);
        return new Response(data.body, { status: data.status, statusText: data.statusText });
    }));
}
function isBrowser() {
    return typeof window !== 'undefined' && !!window;
}
function aoaFetch(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, options = {}, proxyUrl) {
        // Strategy 1: Explicit CORS proxy URL (configured by user)
        if (proxyUrl) {
            console.debug('[AOA] Strategy: configured CORS proxy');
            return corsProxyFetch(proxyUrl, url, options);
        }
        // In non-browser environments (Node.js), direct fetch always works (no CORS)
        if (!isBrowser()) {
            console.debug('[AOA] Direct fetch (server environment):', url);
            return fetch(url, options);
        }
        // Strategy 2: chrome.runtime.sendMessage (Chrome Extension with active service worker)
        if (isChromeExtension()) {
            try {
                console.debug('[AOA] Strategy: chrome.runtime.sendMessage');
                return yield chromeProxyFetch(url, options);
            }
            catch (e) {
                console.debug('[AOA] chrome.runtime.sendMessage failed:', e.message, '— trying next strategy');
            }
        }
        // Strategy 3: Direct fetch (might work if extension has host_permissions or CORS is enabled)
        try {
            console.debug('[AOA] Strategy: direct fetch');
            const response = yield fetch(url, options);
            console.debug('[AOA] Direct fetch succeeded:', response.status);
            return response;
        }
        catch (e) {
            console.debug('[AOA] Direct fetch failed (likely CORS):', e.message, '— trying next strategy');
        }
        // Strategy 4: postMessage bridge (extension with bridge content script)
        if (isBrowserWithPostMessage()) {
            try {
                console.debug('[AOA] Strategy: postMessage bridge');
                return yield postMessageProxyFetch(url, options);
            }
            catch (e) {
                console.debug('[AOA] postMessage bridge failed:', e.message);
            }
        }
        // All strategies exhausted
        throw new Error(`[AOA] All fetch strategies failed for ${url}. ` +
            'This is likely a CORS issue. Possible solutions: ' +
            '1) Add a service worker with host_permissions to the extension manifest, ' +
            '2) Configure aoaProxyUrl pointing to a CORS proxy server, ' +
            '3) Use a backend/CLI environment where CORS does not apply.');
    });
}
class AOAClient {
    constructor(config) {
        this.config = config;
        this.accessToken = '';
        this.tokenExpiresAt = 0;
    }
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.accessToken && Date.now() < this.tokenExpiresAt) {
                return this.accessToken;
            }
            const response = yield aoaFetch(this.config.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    response_type: 'token',
                }),
            }, this.config.proxyUrl);
            if (!response.ok) {
                throw new Error(`Failed to obtain access token: ${response.status} ${response.statusText}`);
            }
            const data = (yield response.json());
            this.accessToken = data.access_token;
            this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
            return this.accessToken;
        });
    }
    sendTrackingReport(reports) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAccessToken();
            const response = yield aoaFetch(`${this.config.apiUrl}/api/automations/tracking-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(reports),
            }, this.config.proxyUrl);
            if (response.status === 201) {
                return;
            }
            const errorBody = (yield response.json().catch(() => ({ errorMessage: response.statusText })));
            throw new Error(`AOA tracking error (${response.status}): ${errorBody.errorMessage}${errorBody.detailedErrors ? ' - ' + JSON.stringify(errorBody.detailedErrors) : ''}`);
        });
    }
}
exports.default = AOAClient;
//# sourceMappingURL=aoaClient.js.map