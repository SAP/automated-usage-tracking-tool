import Usage from '../common/usage';
import { GigyaResponse, GigyaRetryOptions } from './gigya';
export default class Account {
    private apiKey;
    private dataCenter;
    private retryOptions?;
    token: string;
    accountEndpointBaseUrl: string;
    private queue;
    constructor(apiKey: string, dataCenter: string, retryOptions?: GigyaRetryOptions | undefined);
    private enqueue;
    private getAccountBaseUrl;
    private buildAccountEndpoint;
    private formatGigyaError;
    getToken(): Promise<string>;
    setConsent(consent: boolean, email: string): Promise<GigyaResponse>;
    private doSetConsent;
    setLatestUsages(email: string, usages: Usage[]): Promise<GigyaResponse>;
    private doSetLatestUsages;
}
