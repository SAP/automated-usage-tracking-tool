import { ConsentArguments, TrackUsageArguments, TrackerArguments } from '../common/tracker';
export default class Cli {
    private tracker;
    constructor(trackerArguments: TrackerArguments);
    requestConsentQuestion(consentArguments: ConsentArguments): Promise<boolean>;
    requestConsentConfirmation(consentArguments: ConsentArguments): Promise<boolean>;
    trackUsage(trackUsageArguments: TrackUsageArguments): Promise<void>;
    isConsentGranted(): boolean;
}
