"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = __importDefault(require("../common/storage"));
class WebStorage extends storage_1.default {
    constructor(location) {
        super(location);
        this.initStorage();
    }
    initStorage() {
        this.read();
    }
    read() {
        const storedUsage = localStorage.getItem(this.location);
        if (null === storedUsage || undefined === storedUsage) {
            return this;
        }
        return this.toStorage(atob(storedUsage));
    }
    write() {
        localStorage.setItem(this.location, btoa(this.toString()));
    }
}
exports.default = WebStorage;
//# sourceMappingURL=webStorage.js.map