import Usage from './usage';
export default abstract class Storage {
    protected email: string;
    protected consentGranted: boolean;
    protected latestUsages: Usage[];
    protected location: string;
    constructor(location: string);
    isConsentGranted(): boolean;
    toStorage(content: string): this;
    toString(): string;
    getLatestUsages(): Usage[];
    getEmail(): string;
    protected abstract initStorage(): void;
    protected abstract read(): Storage;
    protected abstract write(): void;
    setConsentGranted(consent: boolean, email: string): void;
    setLatestUsage(toolName: string, featureName?: string): void;
    protected filterLatestUsages(): void;
}
