export interface AOAConfig {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
    apiUrl: string;
}
export interface TrackingReport {
    toolId: string;
    customerName: string;
    customerId: string;
    receiverCostObject: string;
    receiverRegion: string;
    executor: string;
    executorCostCenter?: string;
    numberOfExecutions: number;
    actualEffortReduction: number;
    date: string;
}
export interface AOAErrorResponse {
    errorMessage: string;
    detailedErrors?: string[][];
}
export default class AOAClient {
    private config;
    private accessToken;
    private tokenExpiresAt;
    constructor(config: AOAConfig);
    getAccessToken(): Promise<string>;
    sendTrackingReport(reports: TrackingReport[]): Promise<void>;
    trackUsage(toolName: string): Promise<void>;
}
export declare function createAOAClient(): AOAClient | null;
