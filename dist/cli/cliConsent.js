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
const consent_1 = __importDefault(require("../common/consent"));
const readline_1 = __importDefault(require("readline"));
class CliConsent extends consent_1.default {
    constructor() {
        super(...arguments);
        this.cliMessage = `${consent_1.default.message} (Y/n)`;
        this.askConsentConfirm = (msg = this.cliMessage) => {
            const rl = readline_1.default.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            return new Promise((resolve, reject) => {
                rl.question(msg, (response) => __awaiter(this, void 0, void 0, function* () {
                    rl.close();
                    response.toUpperCase() === 'Y' ? resolve(true) : reject(false);
                }));
            });
        };
        this.askConsentQuestion = (msg = this.cliMessage) => {
            const rl = readline_1.default.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            return new Promise((resolve, reject) => {
                rl.question(msg, (response) => __awaiter(this, void 0, void 0, function* () {
                    rl.close();
                    resolve(response.toUpperCase() === 'Y' ? true : false);
                }));
            });
        };
    }
}
exports.default = CliConsent;
//# sourceMappingURL=cliConsent.js.map