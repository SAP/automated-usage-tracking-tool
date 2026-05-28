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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aoaClient_1 = __importDefault(require("../aoa/aoaClient"));
const toolRegistry_1 = require("../aoa/toolRegistry");
const account_1 = __importDefault(require("../gigya/account"));
const AOA_FIXED_FIELDS = {
    customerName: 'MULTIPLE',
    customerId: 'MULTIPLE',
    receiverCostObject: 'MULTIPLE',
    receiverRegion: 'MULTIPLE',
    executor: 'MULTIPLE',
    executorCostCenter: '144496124',
};
class MultiChannelTrackingError extends Error {
    constructor(results) {
        const failedResults = results.filter((result) => !result.success);
        const details = failedResults
            .map((result) => { var _a, _b; return `${result.channel}: ${(_b = (_a = result.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Unknown error'}`; })
            .join('; ');
        super(`Tracking failed for all configured channels. ${details}`);
        this.name = 'MultiChannelTrackingError';
        this.channelErrors = failedResults.reduce((acc, result) => {
            var _a, _b;
            acc[result.channel] = (_b = (_a = result.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Unknown error';
            return acc;
        }, {});
    }
}
function getLocalStorageItem(key) {
    var _a;
    try {
        if (typeof localStorage !== 'undefined') {
            return (_a = localStorage.getItem(key)) !== null && _a !== void 0 ? _a : undefined;
        }
    }
    catch (_b) {
        // localStorage not available
    }
    return undefined;
}
function getChromeStorageItems(keys) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            if (typeof chrome !== 'undefined' && ((_b = (_a = chrome.storage) === null || _a === void 0 ? void 0 : _a.local) === null || _b === void 0 ? void 0 : _b.get)) {
                return yield chrome.storage.local.get(keys);
            }
        }
        catch (_c) {
            // chrome.storage.local not available
        }
        return {};
    });
}
const AOA_DEFAULT_TOKEN_URL = 'https://sapit-crossfunctions-test-manx.authentication.eu10.hana.ondemand.com/oauth/token';
const AOA_DEFAULT_API_URL = 'https://asc-auto-ops-tracking-api-test.cfapps.eu10-004.hana.ondemand.com';
const CDC_COMPLETION_WAIT_MS = 1500;
const CONSENT_EMAIL_DOMAIN = '@automated-usage-tracking-tool.sap';
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function hashIdentifier(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16);
}
function resolveConsentEmail(rawValue) {
    const normalized = rawValue === null || rawValue === void 0 ? void 0 : rawValue.trim();
    if (!normalized) {
        return crypto.randomUUID() + CONSENT_EMAIL_DOMAIN;
    }
    if (isValidEmail(normalized)) {
        return normalized;
    }
    const anonymizedId = hashIdentifier(normalized).slice(0, 10);
    const randomPart = crypto.randomUUID().split('-')[0];
    return `anon-${anonymizedId}-${randomPart}${CONSENT_EMAIL_DOMAIN}`;
}
function resolveAOAConfig(trackerArguments) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        const env = typeof process !== 'undefined' && process.env ? process.env : {};
        const chromeStorage = yield getChromeStorageItems([
            'aoaClientId', 'aoaClientSecret', 'aoaTokenUrl', 'aoaApiUrl', 'aoaProxyUrl',
        ]);
        const clientId = (_d = (_c = (_b = (_a = trackerArguments === null || trackerArguments === void 0 ? void 0 : trackerArguments.clientId) !== null && _a !== void 0 ? _a : chromeStorage.aoaClientId) !== null && _b !== void 0 ? _b : getLocalStorageItem('aoaClientId')) !== null && _c !== void 0 ? _c : env.AOA_CLIENT_ID) !== null && _d !== void 0 ? _d : '';
        const clientSecret = (_h = (_g = (_f = (_e = trackerArguments === null || trackerArguments === void 0 ? void 0 : trackerArguments.clientSecret) !== null && _e !== void 0 ? _e : chromeStorage.aoaClientSecret) !== null && _f !== void 0 ? _f : getLocalStorageItem('aoaClientSecret')) !== null && _g !== void 0 ? _g : env.AOA_CLIENT_SECRET) !== null && _h !== void 0 ? _h : '';
        const tokenUrl = (_m = (_l = (_k = (_j = trackerArguments === null || trackerArguments === void 0 ? void 0 : trackerArguments.tokenUrl) !== null && _j !== void 0 ? _j : chromeStorage.aoaTokenUrl) !== null && _k !== void 0 ? _k : getLocalStorageItem('aoaTokenUrl')) !== null && _l !== void 0 ? _l : env.AOA_TOKEN_URL) !== null && _m !== void 0 ? _m : AOA_DEFAULT_TOKEN_URL;
        const apiUrl = (_r = (_q = (_p = (_o = trackerArguments === null || trackerArguments === void 0 ? void 0 : trackerArguments.apiUrl) !== null && _o !== void 0 ? _o : chromeStorage.aoaApiUrl) !== null && _p !== void 0 ? _p : getLocalStorageItem('aoaApiUrl')) !== null && _q !== void 0 ? _q : env.AOA_API_URL) !== null && _r !== void 0 ? _r : AOA_DEFAULT_API_URL;
        const proxyUrl = (_v = (_u = (_t = (_s = trackerArguments === null || trackerArguments === void 0 ? void 0 : trackerArguments.proxyUrl) !== null && _s !== void 0 ? _s : chromeStorage.aoaProxyUrl) !== null && _t !== void 0 ? _t : getLocalStorageItem('aoaProxyUrl')) !== null && _u !== void 0 ? _u : env.AOA_PROXY_URL) !== null && _v !== void 0 ? _v : undefined;
        const config = { clientId, clientSecret, tokenUrl, apiUrl, proxyUrl };
        if (!config.clientId || !config.clientSecret) {
            return null;
        }
        return config;
    });
}
class Tracker {
    constructor(trackerArguments, storage, consent) {
        var _a, _b;
        this.aoaClient = null;
        this.aoaInitPromise = null;
        this.aoaInitialized = false;
        this.apiKey = (_a = trackerArguments.apiKey) !== null && _a !== void 0 ? _a : '';
        this.dataCenter = (_b = trackerArguments.dataCenter) !== null && _b !== void 0 ? _b : '';
        this.storage = storage;
        this.consent = consent;
        this.trackerArguments = trackerArguments;
        if (trackerArguments.apiKey && trackerArguments.dataCenter) {
            this.account = new account_1.default(trackerArguments.apiKey, trackerArguments.dataCenter, trackerArguments.cdcRetryOptions);
        }
        else {
            this.account = new account_1.default('', '');
        }
    }
    ensureAOAInitialized() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.aoaInitialized)
                return this.aoaClient !== null;
            if (!this.aoaInitPromise) {
                this.aoaInitPromise = this.initAOA();
            }
            yield this.aoaInitPromise;
            return this.aoaClient !== null;
        });
    }
    initAOA() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield resolveAOAConfig(this.trackerArguments);
            if (config) {
                this.aoaClient = new aoaClient_1.default(config);
            }
            this.aoaInitialized = true;
        });
    }
    requestConsentQuestion(consentArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.requestConsent(this.consent.askConsentQuestion.bind(this.consent), consentArguments);
        });
    }
    requestConsentConfirmation(consentArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.requestConsent(this.consent.askConsentConfirm.bind(this.consent), consentArguments);
        });
    }
    provideConsentQuestionAnswer(consentArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.requestConsent(this.consent.provideConsentQuestionAnswer.bind(this.consent), consentArguments);
        });
    }
    provideConsentConfirmAnswer(consentArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.requestConsent(this.consent.provideConsentConfirmAnswer.bind(this.consent), consentArguments);
        });
    }
    trackUsage(trackUsageArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const cdcEnabled = this.apiKey.length > 0 && this.dataCenter.length > 0 && this.storage.isConsentGranted();
            const aoaEnabled = yield this.ensureAOAInitialized();
            if (!cdcEnabled && !aoaEnabled) {
                console.info('[TRACKING] No channel configured or eligible for tracking. Skipping.');
                return;
            }
            const cdcPromise = cdcEnabled
                ? this.executeChannel('CDC', () => __awaiter(this, void 0, void 0, function* () {
                    this.storage.setLatestUsage(trackUsageArguments.toolName, trackUsageArguments.featureName);
                    yield this.account.setLatestUsages(this.storage.getEmail(), this.storage.getLatestUsages());
                }))
                : null;
            const aoaPromise = aoaEnabled
                ? this.executeChannel('AOA', () => __awaiter(this, void 0, void 0, function* () {
                    const report = this.buildAOAReport(trackUsageArguments);
                    yield this.aoaClient.sendTrackingReport([report]);
                }))
                : null;
            if (!aoaPromise && cdcPromise) {
                const cdcResult = yield cdcPromise;
                if (!cdcResult.success) {
                    throw cdcResult.error;
                }
                console.info('[TRACKING] Completed. CDC=success, AOA=not-configured');
                return;
            }
            if (!cdcPromise && aoaPromise) {
                const aoaResult = yield aoaPromise;
                if (!aoaResult.success) {
                    throw aoaResult.error;
                }
                console.info('[TRACKING] Completed. CDC=not-configured, AOA=success');
                return;
            }
            const aoaResult = yield aoaPromise;
            if (aoaResult.success) {
                const cdcResult = yield this.waitForCdcWithinWindow(cdcPromise);
                if (cdcResult) {
                    const cdcStatus = cdcResult.success ? 'success' : 'failure';
                    const details = cdcResult.error ? ` (${cdcResult.error.message})` : '';
                    console.info(`[TRACKING] Completed with success via AOA. CDC=${cdcStatus}${details}`);
                }
                else {
                    console.info(`[TRACKING] Completed with success via AOA. CDC still running after ${CDC_COMPLETION_WAIT_MS}ms window.`);
                    void cdcPromise.then((resolvedCdcResult) => {
                        const cdcStatus = resolvedCdcResult.success ? 'success' : 'failure';
                        const details = resolvedCdcResult.error ? ` (${resolvedCdcResult.error.message})` : '';
                        console.info(`[TRACKING] Final channel status update. CDC=${cdcStatus}${details}, AOA=success`);
                    });
                }
                return;
            }
            const cdcResult = yield cdcPromise;
            if (cdcResult.success) {
                console.error(`[TRACKING] Completed with failure. CDC=success, AOA=failure (${(_b = (_a = aoaResult.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Unknown error'})`);
                throw aoaResult.error;
            }
            const aggregatedError = new MultiChannelTrackingError([cdcResult, aoaResult]);
            console.error(`[TRACKING] Completed with failure. CDC=failure (${(_d = (_c = cdcResult.error) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : 'Unknown error'}), AOA=failure (${(_f = (_e = aoaResult.error) === null || _e === void 0 ? void 0 : _e.message) !== null && _f !== void 0 ? _f : 'Unknown error'})`);
            throw aggregatedError;
        });
    }
    executeChannel(channel, action) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info(`[${channel}] start`);
            try {
                yield action();
                console.info(`[${channel}] success`);
                return { channel, success: true };
            }
            catch (error) {
                const channelError = error instanceof Error ? error : new Error(String(error));
                console.error(`[${channel}] failure: ${channelError.message}`);
                return {
                    channel,
                    success: false,
                    error: channelError,
                };
            }
        });
    }
    waitForCdcWithinWindow(cdcPromise) {
        return __awaiter(this, void 0, void 0, function* () {
            let timeoutId = null;
            const timeoutPromise = new Promise((resolve) => {
                timeoutId = setTimeout(() => resolve(null), CDC_COMPLETION_WAIT_MS);
            });
            const result = yield Promise.race([cdcPromise, timeoutPromise]);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            return result;
        });
    }
    trackUsages(trackUsageArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            const ready = yield this.ensureAOAInitialized();
            if (!ready)
                return;
            const reports = trackUsageArguments.map((args) => this.buildAOAReport(args));
            yield this.aoaClient.sendTrackingReport(reports);
        });
    }
    isConsentGranted() {
        return this.storage.isConsentGranted();
    }
    buildAOAReport(args) {
        const tool = (0, toolRegistry_1.getToolByName)(args.toolName);
        if (!tool) {
            throw new Error(`Tool not found: ${args.toolName}`);
        }
        return Object.assign({ toolId: tool.toolId, numberOfExecutions: 1, actualEffortReduction: tool.actualEffortReduction, date: new Date().toISOString().split('T')[0] }, AOA_FIXED_FIELDS);
    }
    requestConsent(consentFunction, consentArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.storage.isConsentGranted()) {
                const consentResponse = yield consentFunction(consentArguments.message);
                if (consentResponse) {
                    const email = resolveConsentEmail(consentArguments.email);
                    this.storage.setConsentGranted(consentResponse, email);
                    yield this.account.setConsent(consentResponse, email);
                }
                return consentResponse;
            }
            return true;
        });
    }
}
exports.default = Tracker;
//# sourceMappingURL=tracker.js.map