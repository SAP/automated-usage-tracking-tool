"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const aoaClient_1 = __importStar(require("../aoa/aoaClient"));
class WebAoaClient extends aoaClient_1.default {
    constructor() {
        var _a, _b, _c, _d, _e;
        super({
            clientId: (_a = localStorage.getItem('aoaClientId')) !== null && _a !== void 0 ? _a : '',
            clientSecret: (_b = localStorage.getItem('aoaClientSecret')) !== null && _b !== void 0 ? _b : '',
            tokenUrl: (_c = localStorage.getItem('aoaTokenUrl')) !== null && _c !== void 0 ? _c : aoaClient_1.AOA_DEFAULT_TOKEN_URL,
            apiUrl: (_d = localStorage.getItem('aoaApiUrl')) !== null && _d !== void 0 ? _d : aoaClient_1.AOA_DEFAULT_API_URL,
            proxyUrl: (_e = localStorage.getItem('aoaProxyUrl')) !== null && _e !== void 0 ? _e : undefined,
        });
    }
    static create() {
        if (!localStorage.getItem('aoaClientId') || !localStorage.getItem('aoaClientSecret')) {
            return null;
        }
        return new WebAoaClient();
    }
}
exports.default = WebAoaClient;
//# sourceMappingURL=webAoaClient.js.map