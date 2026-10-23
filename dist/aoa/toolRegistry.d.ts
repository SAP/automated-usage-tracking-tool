export interface ToolDefinition {
    toolId: string;
    toolName: string;
    featureName?: string;
    actualEffortReduction: number;
}
declare const TOOL_REGISTRY: ToolDefinition[];
export declare function getToolByName(toolName: string, featureName?: string): ToolDefinition | undefined;
export default TOOL_REGISTRY;
