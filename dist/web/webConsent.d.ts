import Consent from '../common/consent';
export default class WebConsent extends Consent {
    #private;
    warnAOAMissing(message?: string): void;
    askConsentConfirm(message?: string): Promise<boolean>;
    askConsentQuestion(message?: string): Promise<boolean>;
}
