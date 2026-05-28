type Params = Record<string, string>;
export interface GigyaRetryOptions {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    jitterRatio?: number;
}
export type GigyaStep = 'token' | 'consent' | 'usage-write' | 'unknown';
export interface GigyaRequestContext {
    step?: GigyaStep;
    retryOptions?: GigyaRetryOptions;
    endpoint?: string;
}
export interface GigyaResponse {
    callId: string;
    errorCode: number;
    apiVersion: number;
    statusCode: number;
    statusReason: string;
    time: number;
    code?: string;
    errorDetails?: string;
    errorMessage?: string;
    dataCenter?: string;
    regToken?: string;
    UID?: string;
}
export type GigyaErrorKind = 'network' | 'http' | 'json-parse' | 'api-error-code' | 'unknown';
export declare class GigyaRequestError extends Error {
    kind: GigyaErrorKind;
    retryable: boolean;
    step: GigyaStep;
    attempt: number;
    endpoint: string;
    statusCode?: number;
    contentType?: string;
    bodySnippet?: string;
    errorCode?: number;
    errorMessage?: string;
    constructor(args: {
        message: string;
        kind: GigyaErrorKind;
        retryable: boolean;
        step: GigyaStep;
        attempt: number;
        endpoint: string;
        statusCode?: number;
        contentType?: string;
        bodySnippet?: string;
        errorCode?: number;
        errorMessage?: string;
    });
}
declare class Gigya {
    private static readonly RETRYABLE_ERRORS;
    private static readonly RETRYABLE_ERROR_CODES;
    private static readonly DEFAULT_RETRY_OPTIONS;
    private static instance;
    private constructor();
    static getInstance(): Gigya;
    private resolveRetryOptions;
    private buildDelay;
    private normalizeError;
    private getResponseRetryReason;
    private post;
    request(url: string, params: Params, context?: GigyaRequestContext): Promise<GigyaResponse>;
    private delay;
}
export default Gigya;
