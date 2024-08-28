import Usage from '../common/usage';
import { GigyaResponse } from './gigya';
export default class Account {
    private apiKey;
    private dataCenter;
    token: string;
    accountEndpointBaseUrl: string;
    constructor(apiKey: string, dataCenter: string);
    private getAccountBaseUrl;
    private buildAccountEndpoint;
    getToken(): Promise<string>;
    setConsent(consent: boolean, email: string): Promise<GigyaResponse>;
    setLatestUsages(email: string, usages: Usage[]): Promise<GigyaResponse>;
}
