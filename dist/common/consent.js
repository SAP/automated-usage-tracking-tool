"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Consent {
    provideConsentConfirmAnswer(consent = Consent.message) {
        return new Promise((resolve, reject) => {
            (consent === null || consent === void 0 ? void 0 : consent.toUpperCase()) === 'Y' || (consent === null || consent === void 0 ? void 0 : consent.toUpperCase()) === 'YES' ? resolve(true) : reject(false);
        });
    }
    provideConsentQuestionAnswer(consent = Consent.message) {
        return new Promise((resolve, reject) => {
            resolve((consent === null || consent === void 0 ? void 0 : consent.toUpperCase()) === 'Y' || (consent === null || consent === void 0 ? void 0 : consent.toUpperCase()) === 'YES' ? true : false);
        });
    }
}
Consent.message = 'This app collects anonymous usage data to help deliver and improve this product.' +
    ' By installing this app, you agree to share this information with SAP.' +
    ' If you wish to revoke your consent, please uninstall the app. Do you want to continue?';
exports.default = Consent;
//# sourceMappingURL=consent.js.map