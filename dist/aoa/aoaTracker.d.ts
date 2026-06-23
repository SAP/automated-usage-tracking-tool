import { AOAConfig } from './aoaClient';
export default abstract class AoaTracker {
    private client;
    protected abstract resolveConfig(): AOAConfig | null;
    protected abstract warnMissing(message: string): void;
    init(): void;
    trackUsage(toolName: string): Promise<void>;
}
