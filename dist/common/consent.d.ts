export default abstract class Consent {
    static message: string;
    abstract askConsentConfirm(): Promise<boolean>;
    abstract askConsentQuestion(): Promise<boolean>;
    provideConsentConfirmAnswer(consent?: string): Promise<boolean>;
    provideConsentQuestionAnswer(consent?: string): Promise<boolean>;
}
