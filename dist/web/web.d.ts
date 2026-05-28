import { ConsentArguments, TrackUsageArguments, TrackerArguments } from '../common/tracker';
export default class Web {
    private tracker;
    constructor(trackerArguments: TrackerArguments);
    requestConsentQuestion(consentArguments?: ConsentArguments): Promise<boolean>;
    requestConsentConfirmation(consentArguments?: ConsentArguments): Promise<boolean>;
    provideConsentQuestionAnswer(consentArguments: ConsentArguments): Promise<boolean>;
    provideConsentConfirmAnswer(consentArguments: ConsentArguments): Promise<boolean>;
    trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void>;
    trackUsages(trackUsageArguments: TrackUsageArguments[]): Promise<void>;
    isConsentGranted(): boolean;
}
