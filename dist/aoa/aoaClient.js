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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AOA_DEFAULT_API_URL = exports.AOA_DEFAULT_TOKEN_URL = void 0;
const toolRegistry_1 = require("./toolRegistry");
exports.AOA_DEFAULT_TOKEN_URL = 'https://sapit-crossfunctions-prod-ragdoll.authentication.eu10.hana.ondemand.com/oauth/token';
exports.AOA_DEFAULT_API_URL = 'https://asc-auto-ops-tracking-api-prod.cfapps.eu10-004.hana.ondemand.com';
class AOAClient {
    constructor(config) {
        this.config = config;
        this.accessToken = '';
        this.tokenExpiresAt = 0;
    }
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.accessToken && Date.now() < this.tokenExpiresAt) {
                return this.accessToken;
            }
            const response = yield fetch(this.config.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    response_type: 'token',
                }),
            });
            if (!response.ok) {
                throw new Error(`Failed to obtain access token: ${response.status} ${response.statusText}`);
            }
            const data = (yield response.json());
            this.accessToken = data.access_token;
            this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
            return this.accessToken;
        });
    }
    sendTrackingReport(reports) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAccessToken();
            const response = yield fetch(`${this.config.apiUrl}/api/automations/tracking-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(reports),
            });
            if (response.status === 201) {
                return;
            }
            const errorBody = (yield response.json().catch(() => ({ errorMessage: response.statusText })));
            throw new Error(`AOA tracking error (${response.status}): ${errorBody.errorMessage}${errorBody.detailedErrors ? ' - ' + JSON.stringify(errorBody.detailedErrors) : ''}`);
        });
    }
    trackUsage(toolName, featureName) {
        return __awaiter(this, void 0, void 0, function* () {
            const report = buildReport(toolName, featureName);
            yield this.sendTrackingReport([report]);
        });
    }
}
exports.default = AOAClient;
// --- Report building ---
const AOA_FIXED_FIELDS = {
    customerName: 'MULTIPLE',
    customerId: 'MULTIPLE',
    receiverCostObject: 'MULTIPLE',
    receiverRegion: 'MULTIPLE',
    executor: 'MULTIPLE',
    executorCostCenter: '144496124',
};
function buildReport(toolName, featureName) {
    const tool = (0, toolRegistry_1.getTool)(featureName, toolName);
    if (!tool) {
        throw new Error(`Tool not found in registry: ${featureName ? `featureName=${featureName}, ` : ''}toolName=${toolName}`);
    }
    return Object.assign({ toolId: tool.toolId, numberOfExecutions: 1, actualEffortReduction: tool.actualEffortReduction, date: new Date().toISOString().split('T')[0] }, AOA_FIXED_FIELDS);
}
//# sourceMappingURL=aoaClient.js.map