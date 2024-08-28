"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../../node_modules/@types/node/fs.d.ts" />
const storage_1 = __importDefault(require("../common/storage"));
const fs_1 = __importDefault(require("fs"));
class FileStorage extends storage_1.default {
    constructor(location) {
        super(location);
        this.initStorage();
    }
    initStorage() {
        fs_1.default.openSync(this.location, 'a+');
        this.read();
    }
    read() {
        const content = fs_1.default.readFileSync(this.location);
        if (null === content || undefined === content) {
            return this;
        }
        return this.toStorage(atob(content.toString()));
    }
    write() {
        fs_1.default.writeFileSync(this.location, btoa(this.toString()));
    }
}
exports.default = FileStorage;
//# sourceMappingURL=fileStorage.js.map