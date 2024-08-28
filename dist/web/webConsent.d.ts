import Consent from '../common/consent';
export default class WebConsent implements Consent {
    #private;
    askConsentConfirm(message?: string): Promise<boolean>;
    askConsentQuestion(message?: string): Promise<boolean>;
}
