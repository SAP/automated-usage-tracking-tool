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
const gigya_1 = __importDefault(require("./gigya"));
class Account {
    constructor(apiKey, dataCenter) {
        this.apiKey = apiKey;
        this.dataCenter = dataCenter;
        this.apiKey = apiKey;
        this.dataCenter = dataCenter;
        this.token = '';
        this.accountEndpointBaseUrl = this.getAccountBaseUrl();
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
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const body = {
                apiKey: this.apiKey,
                isLite: true,
            };
            const response = yield gigya_1.default.getInstance().request(this.buildAccountEndpoint('initRegistration'), body);
            if (response.errorCode !== 0 || !response.regToken) {
                return Promise.reject(new Error('Error getting token. ' + (response.errorDetails ? response.errorDetails : response.errorMessage)));
            }
            this.token = response.regToken;
            return response.regToken;
        });
    }
    setConsent(consent, email) {
        return __awaiter(this, void 0, void 0, function* () {
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
            let response = yield gigya_1.default.getInstance().request(this.buildAccountEndpoint('setAccountInfo'), body);
            if (response.errorCode === 400006) {
                // token expired
                this.token = '';
                response = yield this.setConsent(consent, email);
            }
            else if (response.errorCode !== 0) {
                return Promise.reject(new Error('Error setting consent. ' + (response.errorDetails ? response.errorDetails : response.errorMessage)));
            }
            return response;
        });
    }
    setLatestUsages(email, usages) {
        return __awaiter(this, void 0, void 0, function* () {
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
            let response = yield gigya_1.default.getInstance().request(this.buildAccountEndpoint('setAccountInfo'), body);
            if (response.errorCode === 400006) {
                // token expired
                this.token = '';
                response = yield this.setLatestUsages(email, usages);
            }
            else if (response.errorCode !== 0) {
                return Promise.reject(new Error('Error setting latest usages. ' + (response.errorDetails ? response.errorDetails : response.errorMessage)));
            }
            return response;
        });
    }
}
exports.default = Account;
//# sourceMappingURL=account.js.map