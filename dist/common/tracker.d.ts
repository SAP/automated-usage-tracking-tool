import Storage from './storage';
import Account from '../gigya/account';
import Consent from './consent';
export default abstract class Tracker {
    apiKey: string;
    dataCenter: string;
    storage: Storage;
    account: Account;
    consent: Consent;
    constructor(trackerArguments: TrackerArguments, storage: Storage, consent: Consent);
    requestConsentQuestion(consentArguments: ConsentArguments): Promise<boolean>;
    requestConsentConfirmation(consentArguments: ConsentArguments): Promise<boolean>;
    trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void>;
    private requestConsent;
}
export interface TrackerArguments {
    apiKey: string;
    dataCenter: string;
    storageName?: string;
}
export interface ConsentArguments {
    email?: string;
    message?: string;
}
export interface TrackUsageArguments {
    toolName: string;
    featureName?: string;
}
