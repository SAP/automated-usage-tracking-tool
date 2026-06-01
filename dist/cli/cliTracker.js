"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tracker_1 = __importDefault(require("../common/tracker"));
const cliConsent_1 = __importDefault(require("./cliConsent"));
const fileStorage_1 = __importDefault(require("./fileStorage"));
class CliTracker extends tracker_1.default {
    constructor(trackerArguments) {
        super(trackerArguments, new fileStorage_1.default(trackerArguments.storageName ? trackerArguments.storageName : 'usageTracking'), new cliConsent_1.default());
    }
}
exports.default = CliTracker;
//# sourceMappingURL=cliTracker.js.map