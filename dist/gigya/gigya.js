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
class Gigya {
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = new Gigya();
        }
        return this.instance;
    }
    post(url, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(body),
            };
            const response = yield fetch(url, requestOptions);
            return yield response.json();
        });
    }
    request(url_1, params_1) {
        return __awaiter(this, arguments, void 0, function* (url, params, retryCount = 0) {
            const body = Object.assign({}, params);
            try {
                const response = yield this.post(url, body);
                if (this.shouldRetry(response, retryCount)) {
                    console.log(`${response.code || response.errorMessage}... Trying again...`);
                    yield this.delay(5000);
                    return yield this.request(url, params, retryCount + 1);
                }
                return response;
            }
            catch (error) {
                if (retryCount < Gigya.MAX_RETRY_COUNT) {
                    console.log(`${error}... Trying again...`);
                    return yield this.request(url, params, retryCount + 1);
                }
                throw error;
            }
        });
    }
    shouldRetry(response, retryCount) {
        return (((response.code !== undefined && Gigya.RETRYABLE_ERRORS.includes(response.code)) ||
            (response.errorCode !== undefined && Gigya.RETRYABLE_ERROR_CODES.includes(response.errorCode))) &&
            retryCount < Gigya.MAX_RETRY_COUNT);
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
Gigya.RETRYABLE_ERRORS = ['ERR_BAD_RESPONSE', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'ERR_SOCKET_CONNECTION_TIMEOUT'];
Gigya.RETRYABLE_ERROR_CODES = [403048, 500001];
Gigya.MAX_RETRY_COUNT = 15;
exports.default = Gigya;
//# sourceMappingURL=gigya.js.map