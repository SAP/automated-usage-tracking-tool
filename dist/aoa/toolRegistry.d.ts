export interface ToolDefinition {
    toolId: string;
    toolName: string;
    actualEffortReduction: number;
}
declare const TOOL_REGISTRY: ToolDefinition[];
export declare function getToolByName(toolName: string): ToolDefinition | undefined;
export declare function getToolById(toolId: string): ToolDefinition | undefined;
export default TOOL_REGISTRY;
