"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _WebAoaTracker_warningDialogId;
Object.defineProperty(exports, "__esModule", { value: true });
const aoaTracker_1 = __importDefault(require("../aoa/aoaTracker"));
class WebAoaTracker extends aoaTracker_1.default {
    constructor() {
        super();
        _WebAoaTracker_warningDialogId.set(this, 'automated-usage-tracking-tool-dialog-warning');
        this.init();
    }
    warnMissing(message) {
        if (typeof document === 'undefined') {
            console.warn(`[AOA] ${message}`);
            return;
        }
        if (!document.getElementById(__classPrivateFieldGet(this, _WebAoaTracker_warningDialogId, "f"))) {
            const html = `
        <dialog id="${__classPrivateFieldGet(this, _WebAoaTracker_warningDialogId, "f")}" style="padding: 4px;">
          <div id="${__classPrivateFieldGet(this, _WebAoaTracker_warningDialogId, "f")}-content">${message}</div>
          <div id="${__classPrivateFieldGet(this, _WebAoaTracker_warningDialogId, "f")}-footer" style="text-align: center; padding-top: 10px;">
            <button id="${__classPrivateFieldGet(this, _WebAoaTracker_warningDialogId, "f")}-close-button">OK</button>
          </div>
        </dialog>`;
            document.body.insertAdjacentHTML('beforeend', html);
            document.getElementById(`${__classPrivateFieldGet(this, _WebAoaTracker_warningDialogId, "f")}-close-button`).addEventListener('click', () => {
                document.getElementById(__classPrivateFieldGet(this, _WebAoaTracker_warningDialogId, "f")).close();
            });
        }
        const dialog = document.getElementById(__classPrivateFieldGet(this, _WebAoaTracker_warningDialogId, "f"));
        if (dialog.showModal) {
            dialog.showModal();
        }
    }
}
_WebAoaTracker_warningDialogId = new WeakMap();
exports.default = WebAoaTracker;
//# sourceMappingURL=webAoaTracker.js.map