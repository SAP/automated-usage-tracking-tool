import { ConsentArguments, TrackUsageArguments, TrackerArguments } from '../common/tracker';
export default class Cli {
    private tracker;
    constructor(trackerArguments?: TrackerArguments);
    /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
    requestConsentQuestion(consentArguments?: ConsentArguments): Promise<boolean>;
    /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
    requestConsentConfirmation(consentArguments?: ConsentArguments): Promise<boolean>;
    /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
    provideConsentQuestionAnswer(consentArguments: ConsentArguments): Promise<boolean>;
    /** @deprecated Consent is no longer required for AOA tracking. Always returns true. */
    provideConsentConfirmAnswer(consentArguments: ConsentArguments): Promise<boolean>;
    trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void>;
    trackUsages(trackUsageArguments: TrackUsageArguments[]): Promise<void>;
    /** @deprecated Consent is always granted with AOA. Always returns true. */
    isConsentGranted(): boolean;
}
