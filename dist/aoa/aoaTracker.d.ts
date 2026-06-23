export default abstract class AoaTracker {
    private client;
    constructor();
    protected abstract warnMissing(message: string): void;
    init(): void;
    trackUsage(toolName: string): Promise<void>;
}
