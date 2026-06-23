import Storage from './storage';
import Account from '../gigya/account';
import Consent from './consent';
import AoaTracker from '../aoa/aoaTracker';
export default abstract class Tracker {
    apiKey: string;
    dataCenter: string;
    storage: Storage;
    account: Account;
    consent: Consent;
    private aoaTracker;
    constructor(trackerArguments: TrackerArguments, storage: Storage, consent: Consent, aoaTracker: AoaTracker);
    requestConsentQuestion(consentArguments: ConsentArguments): Promise<boolean>;
    requestConsentConfirmation(consentArguments: ConsentArguments): Promise<boolean>;
    provideConsentQuestionAnswer(consentArguments: ConsentArguments): Promise<boolean>;
    provideConsentConfirmAnswer(consentArguments: ConsentArguments): Promise<boolean>;
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
