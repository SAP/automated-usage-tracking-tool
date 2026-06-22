import { AOATrackerOptions } from './aoaClient';
export default abstract class AoaTracker {
    private client;
    constructor(options?: AOATrackerOptions);
    protected abstract warnMissing(message: string): void;
    init(): void;
    trackUsage(toolName: string): Promise<void>;
}
