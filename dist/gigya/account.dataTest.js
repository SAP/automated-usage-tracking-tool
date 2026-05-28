"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gigyaResponseMissingRequiredParameter = exports.gigyaResponseTokenExpired = exports.gigyaResponseOk = void 0;
exports.gigyaResponseOk = {
    callId: 'callId',
    errorCode: 0,
    apiVersion: 2,
    statusCode: 200,
    statusReason: 'OK',
    time: Date.now(),
};
exports.gigyaResponseTokenExpired = {
    callId: 'callId',
    errorCode: 400006,
    errorDetails: 'regToken has been revoked',
    errorMessage: 'Invalid parameter value',
    apiVersion: 2,
    statusCode: 400,
    statusReason: 'Bad Request',
    time: Date.now(),
};
exports.gigyaResponseMissingRequiredParameter = {
    callId: 'callId',
    errorCode: 400002,
    errorDetails: 'Missing required parameter: uid',
    errorMessage: 'Missing required parameter',
    apiVersion: 2,
    statusCode: 400,
    statusReason: 'Bad Request',
    time: Date.now(),
};
//# sourceMappingURL=account.dataTest.js.map