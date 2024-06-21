import { v4 as uuidv4 } from 'uuid'
import UsageProperties from './usageProperties'

export default class Usage {
  id: string
  toolName: string
  createdAt: Date

  constructor(toolName: string) {
    this.id = uuidv4()
    this.toolName = toolName
    this.createdAt = new Date()
  }

  static toUsage(jsonObj: UsageProperties) {
    const usage = new Usage(jsonObj.toolName)
    usage.id = jsonObj.id
    usage.createdAt = jsonObj.createdAt
    return usage
  }
}
