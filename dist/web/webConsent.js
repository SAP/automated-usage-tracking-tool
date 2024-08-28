"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _WebConsent_instances, _WebConsent_dialogId, _WebConsent_dialogContentId, _WebConsent_dialogFooterId, _WebConsent_dialogConfirmButtonId, _WebConsent_dialogDeclineButtonId, _WebConsent_setDialog, _WebConsent_getConfirmDialogHTML, _WebConsent_getConfirmDialog, _WebConsent_getDialogButton, _WebConsent_setEventHandler, _WebConsent_confirmDialogExists, _WebConsent_insertConfirmDialog, _WebConsent_commonButtonHandler, _WebConsent_confirmButtonHandler, _WebConsent_declineButtonHandler, _WebConsent_preventEscape;
Object.defineProperty(exports, "__esModule", { value: true });
const consent_1 = __importDefault(require("../common/consent"));
class WebConsent {
    constructor() {
        _WebConsent_instances.add(this);
        _WebConsent_dialogId.set(this, 'automated-usage-tracking-tool-dialog');
        _WebConsent_dialogContentId.set(this, `${__classPrivateFieldGet(this, _WebConsent_dialogId, "f")}-content`);
        _WebConsent_dialogFooterId.set(this, `${__classPrivateFieldGet(this, _WebConsent_dialogId, "f")}-footer`);
        _WebConsent_dialogConfirmButtonId.set(this, `${__classPrivateFieldGet(this, _WebConsent_dialogId, "f")}-confirm-button`);
        _WebConsent_dialogDeclineButtonId.set(this, `${__classPrivateFieldGet(this, _WebConsent_dialogId, "f")}-decline-button`);
    }
    askConsentConfirm(message = consent_1.default.message) {
        // Only allows yes
        return new Promise((resolve) => {
            __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_setDialog).call(this, __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_confirmButtonHandler).call(this, resolve), null, true, message);
        });
    }
    askConsentQuestion(message = consent_1.default.message) {
        // if declines, continues without tracking
        return new Promise((resolve) => {
            __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_setDialog).call(this, __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_confirmButtonHandler).call(this, resolve), __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_declineButtonHandler).call(this, resolve), false, message);
        });
    }
}
_WebConsent_dialogId = new WeakMap(), _WebConsent_dialogContentId = new WeakMap(), _WebConsent_dialogFooterId = new WeakMap(), _WebConsent_dialogConfirmButtonId = new WeakMap(), _WebConsent_dialogDeclineButtonId = new WeakMap(), _WebConsent_instances = new WeakSet(), _WebConsent_setDialog = function _WebConsent_setDialog(confirmButtonHandler, declineButtonHandler, isConfirmDialog, message) {
    if (!__classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_confirmDialogExists).call(this)) {
        __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_insertConfirmDialog).call(this, isConfirmDialog, message);
        __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_setEventHandler).call(this, __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_getDialogButton).call(this, __classPrivateFieldGet(this, _WebConsent_dialogConfirmButtonId, "f")), 'click', confirmButtonHandler);
        __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_preventEscape).call(this);
        if (!isConfirmDialog) {
            __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_setEventHandler).call(this, __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_getDialogButton).call(this, __classPrivateFieldGet(this, _WebConsent_dialogDeclineButtonId, "f")), 'click', declineButtonHandler);
        }
    }
    __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_getConfirmDialog).call(this).showModal();
}, _WebConsent_getConfirmDialogHTML = function _WebConsent_getConfirmDialogHTML(isConfirmDialog, message) {
    const declineButtonHtml = isConfirmDialog ? '' : `<button id=${__classPrivateFieldGet(this, _WebConsent_dialogDeclineButtonId, "f")}>No</button>`;
    return `
          <dialog id=${__classPrivateFieldGet(this, _WebConsent_dialogId, "f")}> 
            <div id=${__classPrivateFieldGet(this, _WebConsent_dialogContentId, "f")}>${message}</div>
            <div id=${__classPrivateFieldGet(this, _WebConsent_dialogFooterId, "f")}>            
              <button id=${__classPrivateFieldGet(this, _WebConsent_dialogConfirmButtonId, "f")}>Yes</button>
              ${declineButtonHtml}
            </div>
          </dialog>`;
}, _WebConsent_getConfirmDialog = function _WebConsent_getConfirmDialog() {
    return document.getElementById(__classPrivateFieldGet(this, _WebConsent_dialogId, "f"));
}, _WebConsent_getDialogButton = function _WebConsent_getDialogButton(buttonId) {
    return document.getElementById(buttonId);
}, _WebConsent_setEventHandler = function _WebConsent_setEventHandler(element, event, handler) {
    element.addEventListener(event, handler);
}, _WebConsent_confirmDialogExists = function _WebConsent_confirmDialogExists() {
    return document.getElementById(__classPrivateFieldGet(this, _WebConsent_dialogId, "f"));
}, _WebConsent_insertConfirmDialog = function _WebConsent_insertConfirmDialog(isConfirmDialog, message) {
    document.body.insertAdjacentHTML('beforeend', __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_getConfirmDialogHTML).call(this, isConfirmDialog, message));
}, _WebConsent_commonButtonHandler = function _WebConsent_commonButtonHandler(resolve, value) {
    __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_getConfirmDialog).call(this).close();
    resolve(value);
}, _WebConsent_confirmButtonHandler = function _WebConsent_confirmButtonHandler(resolve) {
    return () => __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_commonButtonHandler).call(this, resolve, true);
}, _WebConsent_declineButtonHandler = function _WebConsent_declineButtonHandler(resolve) {
    return () => __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_commonButtonHandler).call(this, resolve, false);
}, _WebConsent_preventEscape = function _WebConsent_preventEscape() {
    __classPrivateFieldGet(this, _WebConsent_instances, "m", _WebConsent_getConfirmDialog).call(this).addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
        }
    });
};
exports.default = WebConsent;
//# sourceMappingURL=webConsent.js.map