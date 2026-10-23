import { describe, expect, test } from 'vitest'
import { getToolByName } from './toolRegistry'

describe('getToolByName', () => {
  test('returns base entry when no featureName is provided', () => {
    const tool = getToolByName('One Day Commerce')
    expect(tool).toBeDefined()
    expect(tool?.toolId).toBe('11768')
    expect(tool?.featureName).toBeUndefined()
    expect(tool?.actualEffortReduction).toBe(4)
  })

  test('returns feature entry when featureName matches', () => {
    const tool = getToolByName('One Day Commerce', 'Accelerator Data')
    expect(tool).toBeDefined()
    expect(tool?.toolId).toBe('11768')
    expect(tool?.featureName).toBe('Accelerator Data')
    expect(tool?.actualEffortReduction).toBe(1)
  })

  test('falls back to base entry when featureName has no registry entry', () => {
    const tool = getToolByName('One Day Commerce', 'NonExistentFeature')
    expect(tool).toBeDefined()
    expect(tool?.toolId).toBe('11768')
    expect(tool?.featureName).toBeUndefined()
    expect(tool?.actualEffortReduction).toBe(4)
  })

  test('returns undefined when toolName does not exist', () => {
    const tool = getToolByName('NonExistentTool')
    expect(tool).toBeUndefined()
  })

  test('returns undefined when toolName does not exist even with featureName', () => {
    const tool = getToolByName('NonExistentTool', 'SomeFeature')
    expect(tool).toBeUndefined()
  })
})
