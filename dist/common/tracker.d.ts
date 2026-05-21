import AOAClient from '../aoa/aoaClient';
export default class Tracker {
    aoaClient: AOAClient | null;
    private trackerArguments?;
    private initPromise;
    private initialized;
    constructor(trackerArguments?: TrackerArguments);
    private ensureInitialized;
    private init;
    /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
    requestConsentQuestion(_consentArguments?: ConsentArguments): Promise<boolean>;
    /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
    requestConsentConfirmation(_consentArguments?: ConsentArguments): Promise<boolean>;
    /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
    provideConsentQuestionAnswer(_consentArguments?: ConsentArguments): Promise<boolean>;
    /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
    provideConsentConfirmAnswer(_consentArguments?: ConsentArguments): Promise<boolean>;
    /** @deprecated Consent is always granted with AOA. Always returns true. */
    isConsentGranted(): boolean;
    trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void>;
    trackUsages(trackUsageArguments: TrackUsageArguments[]): Promise<void>;
    private buildReport;
}
export interface TrackerArguments {
    clientId?: string;
    clientSecret?: string;
    tokenUrl?: string;
    apiUrl?: string;
    proxyUrl?: string;
    /** @deprecated No longer used. Kept for backward compatibility. */
    apiKey?: string;
    /** @deprecated No longer used. Kept for backward compatibility. */
    dataCenter?: string;
    /** @deprecated No longer used. Kept for backward compatibility. */
    storageName?: string;
}
/** @deprecated Consent is no longer required for AOA tracking. */
export interface ConsentArguments {
    email?: string;
    message?: string;
}
export interface TrackUsageArguments {
    toolName: string;
    /** @deprecated No longer used. Kept for backward compatibility. */
    featureName?: string;
}
