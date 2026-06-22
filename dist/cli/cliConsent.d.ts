import Consent from '../common/consent';
export default class CliConsent extends Consent {
    private cliMessage;
    askConsentConfirm: (msg?: string) => Promise<boolean>;
    askConsentQuestion: (msg?: string) => Promise<boolean>;
}
