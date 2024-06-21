const gigyaResponseOk = {
  callId: 'callId',
  errorCode: 0,
  apiVersion: 2,
  statusCode: 200,
  statusReason: 'OK',
  time: Date.now(),
}

interface SiteConfigResponse {
  callId: string
  errorCode: number
  apiVersion: number
  statusCode: number
  statusReason: string
  time: number
  dataCenter?: string
  regToken?: string //
}

function getSiteConfigSuccessfulResponse(): Promise<SiteConfigResponse> {
  const data: SiteConfigResponse = Object.assign(gigyaResponseOk, { dataCenter: 'eu1', regToken: 'token' }) //
  //return { json: () => new Promise((resolve) => resolve(data)) }
  //return Object.assign(gigyaResponseOk, {dataCenter: 'eu1'})
  return Promise.resolve(data)
}

function createFetchResponse(data: SiteConfigResponse) {
  return { json: () => new Promise((resolve) => resolve(data)) }
}

export { getSiteConfigSuccessfulResponse, createFetchResponse, gigyaResponseOk }
