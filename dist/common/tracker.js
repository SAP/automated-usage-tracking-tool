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
const FIXED_FIELDS = {
    customerName: 'MULTIPLE',
    customerId: 'MULTIPLE',
    receiverCostObject: 'MULTIPLE',
    receiverRegion: 'MULTIPLE',
    executor: 'MULTIPLE',
    executorCostCenter: '144496124',
};
function getLocalStorageItem(key) {
    var _a;
    try {
        if (typeof localStorage !== 'undefined') {
            const value = (_a = localStorage.getItem(key)) !== null && _a !== void 0 ? _a : undefined;
            if (value)
                console.debug(`[AOA] localStorage: found "${key}"`);
            return value;
        }
    }
    catch (_b) {
        console.debug(`[AOA] localStorage: not available`);
    }
    return undefined;
}
function hasChromeStorageLocal() {
    var _a, _b;
    try {
        const available = typeof chrome !== 'undefined' && !!((_b = (_a = chrome.storage) === null || _a === void 0 ? void 0 : _a.local) === null || _b === void 0 ? void 0 : _b.get);
        console.debug(`[AOA] chrome.storage.local: ${available ? 'available' : 'not available'}`);
        return available;
    }
    catch (_c) {
        console.debug('[AOA] chrome.storage.local: not available (error checking)');
        return false;
    }
}
function getChromeStorageItems(keys) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!hasChromeStorageLocal())
            return {};
        try {
            const result = yield chrome.storage.local.get(keys);
            const foundKeys = Object.keys(result).filter((k) => result[k] !== undefined);
            if (foundKeys.length > 0) {
                console.debug(`[AOA] chrome.storage.local: found keys [${foundKeys.join(', ')}]`);
            }
            else {
                console.debug('[AOA] chrome.storage.local: no AOA keys found');
            }
            return result;
        }
        catch (e) {
            console.debug('[AOA] chrome.storage.local: error reading -', e);
            return {};
        }
    });
}
function resolveConfigAsync(trackerArguments) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        console.debug('[AOA] Resolving configuration...');
        console.debug('[AOA] Constructor args provided:', trackerArguments ? `clientId=${trackerArguments.clientId ? '***' : 'none'}, proxyUrl=${trackerArguments.proxyUrl || 'none'}` : 'none');
        const env = typeof process !== 'undefined' && process.env ? process.env : {};
        // Read chrome.storage.local (async) — highest priority after constructor args
        const chromeStorage = yield getChromeStorageItems([
            'aoaClientId', 'aoaClientSecret', 'aoaTokenUrl', 'aoaApiUrl', 'aoaProxyUrl',
        ]);
        const config = {
            clientId: (_d = (_c = (_b = (_a = trackerArguments === null || trackerArguments === void 0 ? void 0 : trackerArguments.clientId) !== null && _a !== void 0 ? _a : chromeStorage.aoaClientId) !== null && _b !== void 0 ? _b : getLocalStorageItem('aoaClientId')) !== null && _c !== void 0 ? _c : env.AOA_CLIENT_ID) !== null && _d !== void 0 ? _d : '',
            clientSecret: (_h = (_g = (_f = (_e = trackerArguments === null || trackerArguments === void 0 ? void 0 : trackerArguments.clientSecret) !== null && _e !== void 0 ? _e : chromeStorage.aoaClientSecret) !== null && _f !== void 0 ? _f : getLocalStorageItem('aoaClientSecret')) !== null && _g !== void 0 ? _g : env.AOA_CLIENT_SECRET) !== null && _h !== void 0 ? _h : '',
            tokenUrl: (_m = (_l = (_k = (_j = trackerArguments === null || trackerArguments === void 0 ? void 0 : trackerArguments.tokenUrl) !== null && _j !== void 0 ? _j : chromeStorage.aoaTokenUrl) !== null && _k !== void 0 ? _k : getLocalStorageItem('aoaTokenUrl')) !== null && _l !== void 0 ? _l : env.AOA_TOKEN_URL) !== null && _m !== void 0 ? _m : '',
            apiUrl: (_r = (_q = (_p = (_o = trackerArguments === null || trackerArguments === void 0 ? void 0 : trackerArguments.apiUrl) !== null && _o !== void 0 ? _o : chromeStorage.aoaApiUrl) !== null && _p !== void 0 ? _p : getLocalStorageItem('aoaApiUrl')) !== null && _q !== void 0 ? _q : env.AOA_API_URL) !== null && _r !== void 0 ? _r : '',
            proxyUrl: (_v = (_u = (_t = (_s = trackerArguments === null || trackerArguments === void 0 ? void 0 : trackerArguments.proxyUrl) !== null && _s !== void 0 ? _s : chromeStorage.aoaProxyUrl) !== null && _t !== void 0 ? _t : getLocalStorageItem('aoaProxyUrl')) !== null && _u !== void 0 ? _u : env.AOA_PROXY_URL) !== null && _v !== void 0 ? _v : undefined,
        };
        if (!config.clientId || !config.clientSecret || !config.tokenUrl || !config.apiUrl) {
            const missing = [
                !config.clientId && 'clientId',
                !config.clientSecret && 'clientSecret',
                !config.tokenUrl && 'tokenUrl',
                !config.apiUrl && 'apiUrl',
            ].filter(Boolean).join(', ');
            console.debug(`[AOA] Config resolution result: MISSING fields (${missing})`);
            return null;
        }
        console.debug(`[AOA] Config resolution result: OK (clientId=***${config.clientId.slice(-4)}, tokenUrl=${config.tokenUrl}, apiUrl=${config.apiUrl}, proxyUrl=${config.proxyUrl || 'none'})`);
        return config;
    });
}
class Tracker {
    constructor(trackerArguments) {
        this.aoaClient = null;
        this.initPromise = null;
        this.initialized = false;
        console.debug('[AOA] Tracker instance created (lazy init — will resolve config on first trackUsage call)');
        this.trackerArguments = trackerArguments;
    }
    ensureInitialized() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialized)
                return this.aoaClient !== null;
            if (!this.initPromise) {
                console.debug('[AOA] First tracking call — initializing...');
                this.initPromise = this.init();
            }
            yield this.initPromise;
            return this.aoaClient !== null;
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield resolveConfigAsync(this.trackerArguments);
            if (config) {
                this.aoaClient = new aoaClient_1.default(config);
                console.debug('[AOA] Tracking initialized successfully.');
            }
            else {
                console.warn('[AOA] Tracking disabled: configuration incomplete. Required keys: aoaClientId, aoaClientSecret, aoaTokenUrl, aoaApiUrl. Set them via chrome.storage.local, localStorage, or environment variables (AOA_CLIENT_ID, AOA_CLIENT_SECRET, AOA_TOKEN_URL, AOA_API_URL).');
            }
            this.initialized = true;
        });
    }
    /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
    requestConsentQuestion(_consentArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
    requestConsentConfirmation(_consentArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
    provideConsentQuestionAnswer(_consentArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
    provideConsentConfirmAnswer(_consentArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    /** @deprecated Consent is always granted with AOA. Always returns true. */
    isConsentGranted() {
        return true;
    }
    trackUsage(trackUsageArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(`[AOA] trackUsage called: toolName="${trackUsageArguments.toolName}"`);
            const ready = yield this.ensureInitialized();
            if (!ready) {
                console.debug('[AOA] trackUsage skipped: not configured');
                return;
            }
            const report = this.buildReport(trackUsageArguments);
            console.debug(`[AOA] Sending report: toolId=${report.toolId}, date=${report.date}`);
            yield this.aoaClient.sendTrackingReport([report]);
            console.debug('[AOA] Report sent successfully');
        });
    }
    trackUsages(trackUsageArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(`[AOA] trackUsages called: ${trackUsageArguments.length} items`);
            const ready = yield this.ensureInitialized();
            if (!ready) {
                console.debug('[AOA] trackUsages skipped: not configured');
                return;
            }
            const reports = trackUsageArguments.map((args) => this.buildReport(args));
            console.debug(`[AOA] Sending ${reports.length} reports`);
            yield this.aoaClient.sendTrackingReport(reports);
            console.debug('[AOA] Reports sent successfully');
        });
    }
    buildReport(args) {
        const tool = (0, toolRegistry_1.getToolByName)(args.toolName);
        if (!tool) {
            throw new Error(`Tool not found: ${args.toolName}`);
        }
        return Object.assign({ toolId: tool.toolId, numberOfExecutions: 1, actualEffortReduction: tool.actualEffortReduction, date: new Date().toISOString().split('T')[0] }, FIXED_FIELDS);
    }
}
exports.default = Tracker;
//# sourceMappingURL=tracker.js.map