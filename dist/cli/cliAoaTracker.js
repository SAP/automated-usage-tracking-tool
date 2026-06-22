"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aoaTracker_1 = __importDefault(require("../aoa/aoaTracker"));
class CliAoaTracker extends aoaTracker_1.default {
    constructor() {
        super();
        this.init();
    }
    warnMissing(message) {
        console.warn(`[AOA] ${message}`);
    }
}
exports.default = CliAoaTracker;
//# sourceMappingURL=cliAoaTracker.js.map