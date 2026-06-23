import AoaTracker from '../aoa/aoaTracker';
import { AOAConfig } from '../aoa/aoaClient';
export default class WebAoaTracker extends AoaTracker {
    #private;
    constructor();
    protected resolveConfig(): AOAConfig | null;
    protected warnMissing(message: string): void;
}
