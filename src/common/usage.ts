import { v4 as uuidv4 } from 'uuid'

export default class Usage implements UsageProperties {
  id: string
  toolName: string
  featureName: string
  createdAt: Date

  constructor(toolName: string, featureName?: string) {
    this.id = uuidv4()
    this.toolName = toolName
    this.featureName = featureName ? featureName : ''
    this.createdAt = new Date()
  }

  static toUsage(jsonObj: UsageProperties) {
    const usage = new Usage(jsonObj.toolName, jsonObj.featureName)
    usage.id = jsonObj.id
    usage.createdAt = jsonObj.createdAt
    return usage
  }
}

export interface UsageProperties {
  id: string
  toolName: string
  featureName: string
  createdAt: Date
}
