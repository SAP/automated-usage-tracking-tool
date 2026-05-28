"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const gigya_1 = __importStar(require("./gigya"));
const TOKEN_REFRESH_RETRIES = 1;
class Account {
    constructor(apiKey, dataCenter, retryOptions) {
        this.apiKey = apiKey;
        this.dataCenter = dataCenter;
        this.retryOptions = retryOptions;
        this.queue = Promise.resolve();
        this.apiKey = apiKey;
        this.dataCenter = dataCenter;
        this.token = '';
        this.accountEndpointBaseUrl = this.getAccountBaseUrl();
    }
    enqueue(fn) {
        const run = this.queue.then(fn, fn);
        this.queue = run.then(() => { }, () => { });
        return run;
    }
    getAccountBaseUrl() {
        const protocol = 'https';
        const namespace = 'accounts';
        const domain = 'gigya.com';
        return `${protocol}://${namespace}.${this.dataCenter}.${domain}/${namespace}.`;
    }
    buildAccountEndpoint(endpoint) {
        return `${this.accountEndpointBaseUrl}${endpoint}`;
    }
    formatGigyaError(prefix, endpoint, error) {
        var _a, _b, _c;
        if (error instanceof gigya_1.GigyaRequestError) {
            const details = [
                `step=${error.step}`,
                `endpoint=${endpoint}`,
                `attempt=${error.attempt}`,
                `kind=${error.kind}`,
                `statusCode=${(_a = error.statusCode) !== null && _a !== void 0 ? _a : 'n/a'}`,
                `errorCode=${(_b = error.errorCode) !== null && _b !== void 0 ? _b : 'n/a'}`,
                `errorMessage=${(_c = error.errorMessage) !== null && _c !== void 0 ? _c : 'n/a'}`,
            ].join(', ');
            return new Error(`${prefix}. ${details}`);
        }
        const fallbackMessage = error instanceof Error ? error.message : String(error);
        return new Error(`${prefix}. endpoint=${endpoint}, errorMessage=${fallbackMessage}`);
    }
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const body = {
                apiKey: this.apiKey,
                isLite: true,
            };
            const endpoint = 'initRegistration';
            const endpointUrl = this.buildAccountEndpoint(endpoint);
            const startedAt = Date.now();
            console.info(`[CDC] step=token endpoint=${endpoint} start`);
            let response;
            try {
                response = yield gigya_1.default.getInstance().request(endpointUrl, body, {
                    step: 'token',
                    endpoint,
                    retryOptions: this.retryOptions,
                });
                const elapsedMs = Date.now() - startedAt;
                const status = response.errorCode === 0 ? 'success' : 'api-error';
                console.info(`[CDC] step=token endpoint=${endpoint} ${status} elapsedMs=${elapsedMs} statusCode=${(_a = response.statusCode) !== null && _a !== void 0 ? _a : 'n/a'} errorCode=${(_b = response.errorCode) !== null && _b !== void 0 ? _b : 'n/a'}`);
            }
            catch (error) {
                console.error(`[CDC] step=token endpoint=${endpoint} failure elapsedMs=${Date.now() - startedAt}`);
                throw this.formatGigyaError('Error getting token', endpoint, error);
            }
            if (response.errorCode !== 0 || !response.regToken) {
                const details = response.errorDetails ? response.errorDetails : response.errorMessage;
                return Promise.reject(new Error(`Error getting token. endpoint=${endpoint}, errorCode=${response.errorCode}, errorMessage=${details}`));
            }
            this.token = response.regToken;
            return response.regToken;
        });
    }
    setConsent(consent, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.enqueue(() => this.doSetConsent(consent, email));
        });
    }
    doSetConsent(consent, email) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.token.length) {
                this.token = yield this.getToken();
            }
            const body = {
                apiKey: this.apiKey,
                regToken: this.token,
            };
            body.profile = JSON.stringify({ email: email });
            body.preferences = JSON.stringify({
                terms: {
                    anonymousUsageAnalytics: {
                        isConsentGranted: consent,
                    },
                },
            });
            const endpoint = 'setAccountInfo';
            const endpointUrl = this.buildAccountEndpoint(endpoint);
            for (let refreshAttempt = 0; refreshAttempt <= TOKEN_REFRESH_RETRIES; refreshAttempt += 1) {
                const startedAt = Date.now();
                console.info(`[CDC] step=consent endpoint=${endpoint} start`);
                let response;
                try {
                    response = yield gigya_1.default.getInstance().request(endpointUrl, body, {
                        step: 'consent',
                        endpoint,
                        retryOptions: this.retryOptions,
                    });
                }
                catch (error) {
                    console.error(`[CDC] step=consent endpoint=${endpoint} failure elapsedMs=${Date.now() - startedAt}`);
                    throw this.formatGigyaError('Error setting consent', endpoint, error);
                }
                const elapsedMs = Date.now() - startedAt;
                const status = response.errorCode === 0 ? 'success' : 'api-error';
                console.info(`[CDC] step=consent endpoint=${endpoint} ${status} elapsedMs=${elapsedMs} statusCode=${(_a = response.statusCode) !== null && _a !== void 0 ? _a : 'n/a'} errorCode=${(_b = response.errorCode) !== null && _b !== void 0 ? _b : 'n/a'}`);
                if (response.errorCode === 400006) {
                    if (refreshAttempt >= TOKEN_REFRESH_RETRIES) {
                        const details = response.errorDetails ? response.errorDetails : response.errorMessage;
                        return Promise.reject(new Error(`Error setting consent. endpoint=${endpoint}, errorCode=${response.errorCode}, errorMessage=${details}`));
                    }
                    // regToken expired; request a fresh token and retry once.
                    this.token = yield this.getToken();
                    body.regToken = this.token;
                    continue;
                }
                if (response.errorCode !== 0) {
                    const details = response.errorDetails ? response.errorDetails : response.errorMessage;
                    return Promise.reject(new Error(`Error setting consent. endpoint=${endpoint}, errorCode=${response.errorCode}, errorMessage=${details}`));
                }
                return response;
            }
            return Promise.reject(new Error(`Error setting consent. endpoint=${endpoint}, errorMessage=unexpected retry flow`));
        });
    }
    setLatestUsages(email, usages) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.enqueue(() => this.doSetLatestUsages(email, usages));
        });
    }
    doSetLatestUsages(email, usages) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.token.length) {
                this.token = yield this.getToken();
            }
            const body = {
                apiKey: this.apiKey,
                profile: JSON.stringify({
                    email: email,
                }),
                regToken: this.token,
            };
            body.data = JSON.stringify({ latestUsages: usages });
            const endpoint = 'setAccountInfo';
            const endpointUrl = this.buildAccountEndpoint(endpoint);
            for (let refreshAttempt = 0; refreshAttempt <= TOKEN_REFRESH_RETRIES; refreshAttempt += 1) {
                const startedAt = Date.now();
                console.info(`[CDC] step=usage-write endpoint=${endpoint} start`);
                let response;
                try {
                    response = yield gigya_1.default.getInstance().request(endpointUrl, body, {
                        step: 'usage-write',
                        endpoint,
                        retryOptions: this.retryOptions,
                    });
                }
                catch (error) {
                    console.error(`[CDC] step=usage-write endpoint=${endpoint} failure elapsedMs=${Date.now() - startedAt}`);
                    throw this.formatGigyaError('Error setting latest usages', endpoint, error);
                }
                const elapsedMs = Date.now() - startedAt;
                const status = response.errorCode === 0 ? 'success' : 'api-error';
                console.info(`[CDC] step=usage-write endpoint=${endpoint} ${status} elapsedMs=${elapsedMs} statusCode=${(_a = response.statusCode) !== null && _a !== void 0 ? _a : 'n/a'} errorCode=${(_b = response.errorCode) !== null && _b !== void 0 ? _b : 'n/a'}`);
                if (response.errorCode === 400006) {
                    if (refreshAttempt >= TOKEN_REFRESH_RETRIES) {
                        const details = response.errorDetails ? response.errorDetails : response.errorMessage;
                        return Promise.reject(new Error(`Error setting latest usages. endpoint=${endpoint}, errorCode=${response.errorCode}, errorMessage=${details}`));
                    }
                    // regToken expired; request a fresh token and retry once.
                    this.token = yield this.getToken();
                    body.regToken = this.token;
                    continue;
                }
                if (response.errorCode !== 0) {
                    const details = response.errorDetails ? response.errorDetails : response.errorMessage;
                    return Promise.reject(new Error(`Error setting latest usages. endpoint=${endpoint}, errorCode=${response.errorCode}, errorMessage=${details}`));
                }
                return response;
            }
            return Promise.reject(new Error(`Error setting latest usages. endpoint=${endpoint}, errorMessage=unexpected retry flow`));
        });
    }
}
exports.default = Account;
//# sourceMappingURL=account.js.map