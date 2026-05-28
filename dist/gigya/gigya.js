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
exports.GigyaRequestError = void 0;
class GigyaRequestError extends Error {
    constructor(args) {
        super(args.message);
        this.name = 'GigyaRequestError';
        this.kind = args.kind;
        this.retryable = args.retryable;
        this.step = args.step;
        this.attempt = args.attempt;
        this.endpoint = args.endpoint;
        this.statusCode = args.statusCode;
        this.contentType = args.contentType;
        this.bodySnippet = args.bodySnippet;
        this.errorCode = args.errorCode;
        this.errorMessage = args.errorMessage;
    }
}
exports.GigyaRequestError = GigyaRequestError;
class Gigya {
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = new Gigya();
        }
        return this.instance;
    }
    resolveRetryOptions(overrides) {
        const merged = Object.assign(Object.assign({}, Gigya.DEFAULT_RETRY_OPTIONS), (overrides !== null && overrides !== void 0 ? overrides : {}));
        return {
            maxRetries: Math.max(0, merged.maxRetries),
            baseDelayMs: Math.max(0, merged.baseDelayMs),
            maxDelayMs: Math.max(0, merged.maxDelayMs),
            jitterRatio: Math.min(1, Math.max(0, merged.jitterRatio)),
        };
    }
    buildDelay(attempt, retryOptions) {
        const exponentialDelay = Math.min(retryOptions.maxDelayMs, retryOptions.baseDelayMs * (2 ** attempt));
        const jitter = exponentialDelay * retryOptions.jitterRatio * Math.random();
        return Math.floor(exponentialDelay + jitter);
    }
    normalizeError(error, step, attempt, endpoint) {
        if (error instanceof GigyaRequestError) {
            return error;
        }
        const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : undefined;
        const message = error instanceof Error ? error.message : String(error);
        const retryable = code !== undefined && Gigya.RETRYABLE_ERRORS.includes(code);
        return new GigyaRequestError({
            message: `Gigya request failed (${step}) [attempt=${attempt}]${code ? ` [code=${code}]` : ''}: ${message}`,
            kind: retryable ? 'network' : 'unknown',
            retryable,
            step,
            attempt,
            endpoint,
            errorMessage: message,
        });
    }
    getResponseRetryReason(response) {
        var _a;
        if (response.code !== undefined && Gigya.RETRYABLE_ERRORS.includes(response.code)) {
            return `retryable-code:${response.code}`;
        }
        if (response.errorCode !== undefined && Gigya.RETRYABLE_ERROR_CODES.includes(response.errorCode)) {
            return `retryable-errorCode:${response.errorCode}`;
        }
        if ((_a = response.errorMessage) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('rate limit')) {
            return `retryable-errorMessage:${response.errorMessage}`;
        }
        return null;
    }
    post(url, body, step, attempt, endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(body),
            };
            const response = yield fetch(url, requestOptions);
            if (typeof response.text === 'function') {
                const statusCode = response.status;
                const statusText = (_a = response.statusText) !== null && _a !== void 0 ? _a : 'Unknown status';
                const contentType = typeof ((_b = response.headers) === null || _b === void 0 ? void 0 : _b.get) === 'function'
                    ? (_c = response.headers.get('content-type')) !== null && _c !== void 0 ? _c : undefined
                    : undefined;
                const rawBody = yield response.text();
                try {
                    return JSON.parse(rawBody);
                }
                catch (_d) {
                    const bodySnippet = rawBody.slice(0, 180).replace(/\s+/g, ' ').trim();
                    throw new GigyaRequestError({
                        message: `Gigya non-JSON response (${step}) [attempt=${attempt}] [status=${statusCode !== null && statusCode !== void 0 ? statusCode : 'unknown'}] [contentType=${contentType !== null && contentType !== void 0 ? contentType : 'unknown'}]`,
                        kind: 'json-parse',
                        retryable: false,
                        step,
                        attempt,
                        endpoint,
                        statusCode,
                        contentType,
                        bodySnippet,
                        errorMessage: statusText,
                    });
                }
            }
            if (typeof response.json === 'function') {
                return yield response.json();
            }
            throw new GigyaRequestError({
                message: `Gigya response cannot be parsed (${step}) [attempt=${attempt}]`,
                kind: 'unknown',
                retryable: false,
                step,
                attempt,
                endpoint,
            });
        });
    }
    request(url, params, context) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const body = Object.assign({}, params);
            const step = (_a = context === null || context === void 0 ? void 0 : context.step) !== null && _a !== void 0 ? _a : 'unknown';
            const endpoint = (_c = (_b = context === null || context === void 0 ? void 0 : context.endpoint) !== null && _b !== void 0 ? _b : url.split('/').pop()) !== null && _c !== void 0 ? _c : 'unknown';
            const retryOptions = this.resolveRetryOptions(context === null || context === void 0 ? void 0 : context.retryOptions);
            for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt += 1) {
                const startedAt = Date.now();
                try {
                    const response = yield this.post(url, body, step, attempt, endpoint);
                    const retryReason = this.getResponseRetryReason(response);
                    if (!retryReason) {
                        return response;
                    }
                    const elapsedMs = Date.now() - startedAt;
                    if (attempt >= retryOptions.maxRetries) {
                        throw new GigyaRequestError({
                            message: `Gigya retry limit reached (${step}) [attempt=${attempt}] [reason=${retryReason}]`,
                            kind: 'api-error-code',
                            retryable: true,
                            step,
                            attempt,
                            endpoint,
                            statusCode: response.statusCode,
                            errorCode: response.errorCode,
                            errorMessage: response.errorMessage,
                        });
                    }
                    const delayMs = this.buildDelay(attempt, retryOptions);
                    console.warn(`[CDC] step=${step} endpoint=${endpoint} attempt=${attempt + 1} elapsedMs=${elapsedMs} statusCode=${(_d = response.statusCode) !== null && _d !== void 0 ? _d : 'n/a'} errorCode=${(_e = response.errorCode) !== null && _e !== void 0 ? _e : 'n/a'} errorMessage=${(_g = (_f = response.errorMessage) !== null && _f !== void 0 ? _f : response.code) !== null && _g !== void 0 ? _g : 'n/a'} retryInMs=${delayMs}`);
                    yield this.delay(delayMs);
                }
                catch (error) {
                    const normalizedError = this.normalizeError(error, step, attempt, endpoint);
                    const elapsedMs = Date.now() - startedAt;
                    if (!normalizedError.retryable || attempt >= retryOptions.maxRetries) {
                        throw normalizedError;
                    }
                    const delayMs = this.buildDelay(attempt, retryOptions);
                    console.warn(`[CDC] step=${step} endpoint=${endpoint} attempt=${attempt + 1} elapsedMs=${elapsedMs} kind=${normalizedError.kind} statusCode=${(_h = normalizedError.statusCode) !== null && _h !== void 0 ? _h : 'n/a'} errorCode=${(_j = normalizedError.errorCode) !== null && _j !== void 0 ? _j : 'n/a'} errorMessage=${(_k = normalizedError.errorMessage) !== null && _k !== void 0 ? _k : normalizedError.message} retryInMs=${delayMs}`);
                    yield this.delay(delayMs);
                }
            }
            throw new GigyaRequestError({
                message: `Gigya request failed unexpectedly (${step})`,
                kind: 'unknown',
                retryable: false,
                step,
                attempt: retryOptions.maxRetries,
                endpoint,
            });
        });
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
Gigya.RETRYABLE_ERRORS = ['ERR_BAD_RESPONSE', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'ERR_SOCKET_CONNECTION_TIMEOUT'];
Gigya.RETRYABLE_ERROR_CODES = [403048, 500001];
Gigya.DEFAULT_RETRY_OPTIONS = {
    maxRetries: 4,
    baseDelayMs: 400,
    maxDelayMs: 5000,
    jitterRatio: 0.2,
};
exports.default = Gigya;
//# sourceMappingURL=gigya.js.map