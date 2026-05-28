"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tracker_1 = __importDefault(require("../common/tracker"));
const webConsent_1 = __importDefault(require("./webConsent"));
const webStorage_1 = __importDefault(require("./webStorage"));
class WebTracker extends tracker_1.default {
    constructor(trackerArguments) {
        super(trackerArguments, new webStorage_1.default(trackerArguments.storageName ? trackerArguments.storageName : 'usageTracking'), new webConsent_1.default());
    }
}
exports.default = WebTracker;
//# sourceMappingURL=webTracker.js.map