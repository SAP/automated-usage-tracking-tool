import AoaTracker from '../aoa/aoaTracker';
import { AOAConfig } from '../aoa/aoaClient';
export default class CliAoaTracker extends AoaTracker {
    constructor();
    protected resolveConfig(): AOAConfig | null;
    protected warnMissing(message: string): void;
}
