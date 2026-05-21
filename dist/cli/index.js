"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToolByName = exports.default = void 0;
var cli_1 = require("./cli");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(cli_1).default; } });
var toolRegistry_1 = require("../aoa/toolRegistry");
Object.defineProperty(exports, "getToolByName", { enumerable: true, get: function () { return toolRegistry_1.getToolByName; } });
//# sourceMappingURL=index.js.map