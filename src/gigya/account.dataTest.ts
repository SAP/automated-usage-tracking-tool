export const gigyaResponseOk = {
  callId: 'callId',
  errorCode: 0,
  apiVersion: 2,
  statusCode: 200,
  statusReason: 'OK',
  time: Date.now(),
}

export const gigyaResponseTokenExpired = {
  callId: 'callId',
  errorCode: 400006,
  errorDetails: 'regToken has been revoked',
  errorMessage: 'Invalid parameter value',
  apiVersion: 2,
  statusCode: 400,
  statusReason: 'Bad Request',
  time: Date.now(),
}

export const gigyaResponseMissingRequiredParameter = {
  callId: 'callId',
  errorCode: 400002,
  errorDetails: 'Missing required parameter: uid',
  errorMessage: 'Missing required parameter',
  apiVersion: 2,
  statusCode: 400,
  statusReason: 'Bad Request',
  time: Date.now(),
}
