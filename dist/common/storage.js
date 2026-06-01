"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const usage_1 = __importDefault(require("./usage"));
class Storage {
    constructor(location) {
        this.location = location;
        this.email = '';
        this.consentGranted = false;
        this.latestUsages = [];
    }
    isConsentGranted() {
        return this.consentGranted;
    }
    toStorage(content) {
        if ((content === null || content === void 0 ? void 0 : content.length) > 0) {
            const jsonObj = JSON.parse(content);
            this.consentGranted = jsonObj.consentGranted;
            this.email = jsonObj.email;
            this.latestUsages = [];
            jsonObj.latestUsages.map((u) => {
                this.latestUsages.push(usage_1.default.toUsage(u));
            });
        }
        return this;
    }
    toString() {
        return JSON.stringify({
            location: this.location,
            consentGranted: this.consentGranted,
            email: this.email,
            latestUsages: this.latestUsages,
        });
    }
    getLatestUsages() {
        return this.latestUsages;
    }
    getEmail() {
        return this.email;
    }
    setConsentGranted(consent, email) {
        this.consentGranted = consent;
        this.email = email;
        this.write();
    }
    setLatestUsage(toolName, featureName) {
        this.filterLatestUsages();
        const usage = new usage_1.default(toolName, featureName);
        this.latestUsages.push(usage);
        this.write();
    }
    filterLatestUsages() {
        this.latestUsages = this.latestUsages.filter((usage) => {
            const THIRTY_MINUTES = 30 * 60 * 1000; // ms
            return Math.abs(new Date().getTime() - new Date(usage.createdAt).getTime()) < THIRTY_MINUTES;
        });
    }
}
exports.default = Storage;
//# sourceMappingURL=storage.js.map