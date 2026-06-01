type Params = Record<string, string>;
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
declare class Gigya {
    private static readonly RETRYABLE_ERRORS;
    private static readonly RETRYABLE_ERROR_CODES;
    private static readonly MAX_RETRY_COUNT;
    private static instance;
    private constructor();
    static getInstance(): Gigya;
    private post;
    request(url: string, params: Params, retryCount?: number): Promise<GigyaResponse>;
    private shouldRetry;
    private delay;
}
export default Gigya;
