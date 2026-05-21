"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToolByName = getToolByName;
exports.getToolById = getToolById;
const TOOL_REGISTRY = [
    { toolId: '501', toolName: 'UMAT - Upgrade & Migration Assessment Automation for SAP Commerce (Legacy)', actualEffortReduction: 15 },
    { toolId: '502', toolName: 'Commerce Upgrade Assistant', actualEffortReduction: 10 },
    { toolId: '503', toolName: 'Quality Toolbox', actualEffortReduction: 20 },
    { toolId: '505', toolName: 'Commerce Initializr', actualEffortReduction: 11 },
    { toolId: '507', toolName: 'Cloud Readiness Check', actualEffortReduction: 7 },
    { toolId: '510', toolName: 'Commerce Migration Toolkit', actualEffortReduction: 15 },
    { toolId: '509', toolName: 'Platform Upgrade Assessment', actualEffortReduction: 7 },
    { toolId: '509', toolName: 'Platform Upgrade Assessment (Legacy)', actualEffortReduction: 5 },
    { toolId: '510', toolName: 'SAP Commerce Migration Utilities', actualEffortReduction: 2 },
    { toolId: '511', toolName: 'Hawkeye Agent', actualEffortReduction: 5 },
    { toolId: '515', toolName: 'CRM Move', actualEffortReduction: 5 },
    { toolId: '514', toolName: 'CX Bid Estimator', actualEffortReduction: 6 },
    { toolId: '520', toolName: 'Customer Data Cloud accelerator', actualEffortReduction: 30 },
    { toolId: '11827', toolName: 'Customer Data Cloud toolkit', actualEffortReduction: 5 },
    { toolId: '501', toolName: 'UMAT - Upgrade & Migration Assessment Automation for SAP Commerce (3.0)', actualEffortReduction: 17 },
    { toolId: '517', toolName: 'Multicountry Extension', actualEffortReduction: 30 },
    { toolId: '518', toolName: 'DTOCaching', actualEffortReduction: 14 },
    { toolId: '501', toolName: 'UMAT - Upgrade & Migration Assessment Automation for SAP Commerce (3.1)', actualEffortReduction: 18 },
    { toolId: '521', toolName: 'Continuous Update', actualEffortReduction: 20 },
    { toolId: '522', toolName: 'OpenAPI 3 Tool', actualEffortReduction: 2 },
    { toolId: '525', toolName: 'Commerce - CI/CD', actualEffortReduction: 1 },
    { toolId: '534', toolName: 'Central Features Repository', actualEffortReduction: 2 },
    { toolId: '526', toolName: 'Multi Country Cloud Hot Folder Suite', actualEffortReduction: 8 },
    { toolId: '535', toolName: 'Commerce Automator plugin', actualEffortReduction: 5 },
    { toolId: '547', toolName: 'UI Boilerplate', actualEffortReduction: 10 },
    { toolId: '524', toolName: 'SAP Commerce DB Sync', actualEffortReduction: 20 },
    { toolId: '543', toolName: 'Self-Service Portal', actualEffortReduction: 125 },
    { toolId: '528', toolName: 'SAP Sales Cloud V2 Configuration Accelerator', actualEffortReduction: 17 },
    { toolId: '528', toolName: 'SAP Service Cloud V2 Configuration Accelerator', actualEffortReduction: 17 },
    { toolId: '530', toolName: 'SAP C4C V1 Configuration Accelerator', actualEffortReduction: 22 },
    { toolId: '531', toolName: 'SAP Service Cloud V2 Layout Extension', actualEffortReduction: 22 },
    { toolId: '533', toolName: 'CX Translations', actualEffortReduction: 15 },
    { toolId: '536', toolName: 'Jumpstart Commerce', actualEffortReduction: 10 },
    { toolId: '544', toolName: 'CX Integration toolkit', actualEffortReduction: 12 },
    { toolId: '527', toolName: 'Composable Storefront Upgrade Analyzer', actualEffortReduction: 20 },
    { toolId: '539', toolName: 'Sales & Service Cloud Custom Business Object Migration Toolkit (CBOM)', actualEffortReduction: 10 },
    { toolId: '545', toolName: 'CX AIDE', actualEffortReduction: 18 },
    { toolId: '11768', toolName: 'One Day Commerce', actualEffortReduction: 4 },
    { toolId: '11829', toolName: 'AI Unit Tests Automation', actualEffortReduction: 2 },
    { toolId: '11762', toolName: 'Open Payment Framework SDK', actualEffortReduction: 19 },
    { toolId: '546', toolName: 'Easy Extension Framework', actualEffortReduction: 20 },
    { toolId: '532', toolName: 'JRebel', actualEffortReduction: 45 },
    { toolId: '11771', toolName: 'acc2cs', actualEffortReduction: 15 },
    { toolId: '504', toolName: 'DataHub Assessment Toolkit (DHAT)', actualEffortReduction: 10 },
    { toolId: '506', toolName: 'Express Commerce Toolbox', actualEffortReduction: 20 },
    { toolId: '11825', toolName: 'CDC CQC', actualEffortReduction: 3 },
    { toolId: '530', toolName: 'SAP Service Cloud V1 Configuration Accelerator', actualEffortReduction: 17 },
    { toolId: '11831', toolName: 'Design Studio for CX', actualEffortReduction: 3 },
    { toolId: '230', toolName: 'Customer 360 based on CDP', actualEffortReduction: 30 },
    { toolId: '542', toolName: 'Media Storage Utilization Assessment', actualEffortReduction: 4 },
    { toolId: '11830', toolName: 'UpgrAI - Commerce Cloud Upgrade Assistant', actualEffortReduction: 30 },
    { toolId: '13021', toolName: 'Emarsys - js snippet for Composable Storefront Upgrade Analyzer', actualEffortReduction: 4 },
    { toolId: '516', toolName: 'CDC Data Workbench', actualEffortReduction: 9 },
    { toolId: '11750', toolName: 'Assessmate', actualEffortReduction: 8 },
    { toolId: '11788', toolName: 'commercecpihookcapture commercecpihookcapturebackoffice', actualEffortReduction: 19 },
    { toolId: '11798', toolName: 'Commerce Document Management System Integration', actualEffortReduction: 27.5 },
];
function getToolByName(toolName) {
    return TOOL_REGISTRY.find((t) => t.toolName === toolName);
}
function getToolById(toolId) {
    return TOOL_REGISTRY.find((t) => t.toolId === toolId);
}
exports.default = TOOL_REGISTRY;
//# sourceMappingURL=toolRegistry.js.map