export default class Usage implements UsageProperties {
    id: string;
    toolName: string;
    featureName: string;
    createdAt: Date;
    constructor(toolName: string, featureName?: string);
    static toUsage(jsonObj: UsageProperties): Usage;
}
export interface UsageProperties {
    id: string;
    toolName: string;
    featureName: string;
    createdAt: Date;
}
