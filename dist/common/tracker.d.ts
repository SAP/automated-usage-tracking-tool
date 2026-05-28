import AOAClient from '../aoa/aoaClient';
import Storage from './storage';
import Account from '../gigya/account';
import Consent from './consent';
import { GigyaRetryOptions } from '../gigya/gigya';
export default abstract class Tracker {
    apiKey: string;
    dataCenter: string;
    storage: Storage;
    account: Account;
    consent: Consent;
    aoaClient: AOAClient | null;
    private trackerArguments?;
    private aoaInitPromise;
    private aoaInitialized;
    constructor(trackerArguments: TrackerArguments, storage: Storage, consent: Consent);
    private ensureAOAInitialized;
    private initAOA;
    requestConsentQuestion(consentArguments: ConsentArguments): Promise<boolean>;
    requestConsentConfirmation(consentArguments: ConsentArguments): Promise<boolean>;
    provideConsentQuestionAnswer(consentArguments: ConsentArguments): Promise<boolean>;
    provideConsentConfirmAnswer(consentArguments: ConsentArguments): Promise<boolean>;
    trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void>;
    private executeChannel;
    private waitForCdcWithinWindow;
    trackUsages(trackUsageArguments: TrackUsageArguments[]): Promise<void>;
    isConsentGranted(): boolean;
    private buildAOAReport;
    private requestConsent;
}
export interface TrackerArguments {
    apiKey?: string;
    dataCenter?: string;
    storageName?: string;
    cdcRetryOptions?: GigyaRetryOptions;
    clientId?: string;
    clientSecret?: string;
    tokenUrl?: string;
    apiUrl?: string;
    proxyUrl?: string;
}
export interface ConsentArguments {
    email?: string;
    message?: string;
}
export interface TrackUsageArguments {
    toolName: string;
    featureName?: string;
}
