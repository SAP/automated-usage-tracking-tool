export default abstract class Consent {
    static message: string;
    abstract askConsentConfirm(): Promise<boolean>;
    abstract askConsentQuestion(): Promise<boolean>;
}
