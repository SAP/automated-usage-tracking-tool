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
const webTracker_1 = __importDefault(require("./webTracker"));
class Web {
    constructor(trackerArguments) {
        this.tracker = new webTracker_1.default(trackerArguments);
    }
    requestConsentQuestion() {
        return __awaiter(this, arguments, void 0, function* (consentArguments = {}) {
            return yield this.tracker.requestConsentQuestion(consentArguments);
        });
    }
    requestConsentConfirmation() {
        return __awaiter(this, arguments, void 0, function* (consentArguments = {}) {
            return yield this.tracker.requestConsentConfirmation(consentArguments);
        });
    }
    trackUsage(trackUsageArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.tracker.trackUsage(trackUsageArguments);
        });
    }
    isConsentGranted() {
        return this.tracker.storage.isConsentGranted();
    }
}
exports.default = Web;
//# sourceMappingURL=web.js.map