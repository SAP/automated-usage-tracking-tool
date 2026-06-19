export default abstract class Consent {
    static message: string;
    static aoaMissingMessage: string;
    abstract askConsentConfirm(): Promise<boolean>;
    abstract askConsentQuestion(): Promise<boolean>;
    abstract warnAOAMissing(message?: string): void;
    provideConsentConfirmAnswer(consent?: string): Promise<boolean>;
    provideConsentQuestionAnswer(consent?: string): Promise<boolean>;
}
