export interface ToolDefinition {
    toolId: string;
    toolName: string;
    featureName?: string;
    actualEffortReduction: number;
}
declare const TOOL_REGISTRY: ToolDefinition[];
export declare function getToolByFeatureName(featureName: string): ToolDefinition | undefined;
export declare function getToolByName(toolName: string): ToolDefinition | undefined;
export declare function getTool(featureName?: string, toolName?: string): ToolDefinition | undefined;
export default TOOL_REGISTRY;
