"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class Usage {
    constructor(toolName, featureName) {
        this.id = (0, uuid_1.v4)();
        this.toolName = toolName;
        this.featureName = featureName ? featureName : '';
        this.createdAt = new Date();
    }
    static toUsage(jsonObj) {
        const usage = new Usage(jsonObj.toolName, jsonObj.featureName);
        usage.id = jsonObj.id;
        usage.createdAt = jsonObj.createdAt;
        return usage;
    }
}
exports.default = Usage;
//# sourceMappingURL=usage.js.map