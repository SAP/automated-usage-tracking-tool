import { v4 as uuidv4 } from 'uuid'

export default class Usage {
  properties: UsageProperties

  constructor(toolName: string, featureName?: string) {
    this.properties = {
      id: uuidv4(),
      toolName: toolName,
      featureName: featureName ? featureName : '',
      createdAt: new Date(),
    }
  }

  static toUsage(jsonObj: UsageProperties) {
    const usage = new Usage(jsonObj.toolName, jsonObj.featureName)
    usage.properties.id = jsonObj.id
    usage.properties.createdAt = jsonObj.createdAt
    return usage
  }
}

export interface UsageProperties {
  id: string
  toolName: string
  featureName: string
  createdAt: Date
}
