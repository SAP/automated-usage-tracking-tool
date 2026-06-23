"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aoaClient_1 = __importDefault(require("./aoaClient"));
const AOA_MISSING_MESSAGE = 'AOA tracking is not configured. Please provide AOA_CLIENT_ID and AOA_CLIENT_SECRET to enable AOA tracking.';
class AoaTracker {
    constructor() {
        this.client = null;
    }
    init() {
        const config = this.resolveConfig();
        this.client = config ? new aoaClient_1.default(config) : null;
        if (!this.client) {
            this.warnMissing(AOA_MISSING_MESSAGE);
        }
    }
    trackUsage(toolName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                try {
                    yield this.client.trackUsage(toolName);
                }
                catch (error) {
                    console.error('[AOA] tracking failed:', error instanceof Error ? error.message : error);
                }
            }
        });
    }
}
exports.default = AoaTracker;
//# sourceMappingURL=aoaTracker.js.map