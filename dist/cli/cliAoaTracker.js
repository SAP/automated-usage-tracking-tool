"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aoaTracker_1 = __importDefault(require("../aoa/aoaTracker"));
const aoaClient_1 = require("../aoa/aoaClient");
class CliAoaTracker extends aoaTracker_1.default {
    constructor() {
        super();
        this.init();
    }
    resolveConfig() {
        var _a, _b, _c, _d;
        const clientId = (_a = process.env.AOA_CLIENT_ID) !== null && _a !== void 0 ? _a : '';
        const clientSecret = (_b = process.env.AOA_CLIENT_SECRET) !== null && _b !== void 0 ? _b : '';
        if (!clientId || !clientSecret)
            return null;
        const tokenUrl = (_c = process.env.AOA_TOKEN_URL) !== null && _c !== void 0 ? _c : aoaClient_1.AOA_DEFAULT_TOKEN_URL;
        const apiUrl = (_d = process.env.AOA_API_URL) !== null && _d !== void 0 ? _d : aoaClient_1.AOA_DEFAULT_API_URL;
        return { clientId, clientSecret, tokenUrl, apiUrl };
    }
    warnMissing(message) {
        console.warn(`[AOA] ${message}`);
    }
}
exports.default = CliAoaTracker;
//# sourceMappingURL=cliAoaTracker.js.map