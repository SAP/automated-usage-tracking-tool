import { describe, test, expect, vi, beforeEach } from 'vitest'
import Usage, { UsageProperties } from './usage'

describe('Usage', () => {
  const toolName: string = 'tool name'

  test('toUsage', () => {
    const featureName: string = 'feature name'
    const id: string = 'id'
    const now: Date = new Date()

    const usageProperties = {
      id: id,
      toolName: toolName,
      featureName: featureName,
      createdAt: now,
    }
    const usage = Usage.toUsage(usageProperties)
    expect(usage.createdAt).toBe(now)
    expect(usage.featureName).toBe(featureName)
    expect(usage.id).toBe(id)
    expect(usage.toolName).toBe(toolName)
  })

  test('constructor', () => {
    const usage = new Usage(toolName)
    expect(usage.createdAt).toBeDefined()
    expect(usage.featureName).toBe('')
    expect(usage.id).toBeDefined()
    expect(usage.toolName).toBe(toolName)
  })
})
