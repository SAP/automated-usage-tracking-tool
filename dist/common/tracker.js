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
const account_1 = __importDefault(require("../gigya/account"));
class Tracker {
    constructor(trackerArguments, storage, consent) {
        this.apiKey = trackerArguments.apiKey;
        this.dataCenter = trackerArguments.dataCenter;
        this.account = new account_1.default(this.apiKey, this.dataCenter);
        this.storage = storage;
        this.consent = consent;
    }
    requestConsentQuestion(consentArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.requestConsent(this.consent.askConsentQuestion.bind(this.consent), consentArguments);
        });
    }
    requestConsentConfirmation(consentArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.requestConsent(this.consent.askConsentConfirm.bind(this.consent), consentArguments);
        });
    }
    trackUsage(trackUsageArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.storage.isConsentGranted()) {
                this.storage.setLatestUsage(trackUsageArguments.toolName, trackUsageArguments.featureName);
                yield this.account.setLatestUsages(this.storage.getEmail(), this.storage.getLatestUsages());
            }
        });
    }
    requestConsent(consentFunction, consentArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.storage.isConsentGranted()) {
                const consentResponse = yield consentFunction(consentArguments.message);
                if (consentResponse) {
                    const email = consentArguments.email ? consentArguments.email : crypto.randomUUID() + '@automated-usage-tracking-tool.sap';
                    this.storage.setConsentGranted(consentResponse, email);
                    yield this.account.setConsent(consentResponse, email);
                }
                return consentResponse;
            }
            return true;
        });
    }
}
exports.default = Tracker;
//# sourceMappingURL=tracker.js.map