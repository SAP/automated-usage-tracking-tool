import { describe, expect, test } from 'vitest'
import { getToolByName, getToolByFeatureName, getTool } from './toolRegistry'

describe('toolRegistry', () => {
  describe('getToolByName', () => {
    test('returns tool when toolName matches', () => {
      const tool = getToolByName('Commerce Upgrade Assistant')
      expect(tool).toBeDefined()
      expect(tool!.toolId).toBe('502')
      expect(tool!.actualEffortReduction).toBe(10)
    })

    test('returns undefined when toolName does not match', () => {
      expect(getToolByName('NonExistentTool')).toBeUndefined()
    })
  })

  describe('getToolByFeatureName', () => {
    test('returns tool when featureName matches', () => {
      const tool = getToolByFeatureName('Email Templates')
      expect(tool).toBeDefined()
      expect(tool!.toolId).toBe('11827')
      expect(tool!.toolName).toBe('Customer Data Cloud toolkit')
      expect(tool!.actualEffortReduction).toBe(1)
    })

    test('returns undefined when featureName does not match', () => {
      expect(getToolByFeatureName('NonExistentFeature')).toBeUndefined()
    })
  })

  describe('getTool', () => {
    test('returns tool by featureName when it exists', () => {
      const tool = getTool('Site Deployer', 'Commerce Upgrade Assistant')
      expect(tool).toBeDefined()
      expect(tool!.toolId).toBe('11827')
      expect(tool!.featureName).toBe('Site Deployer')
    })

    test('falls back to toolName when featureName is not found', () => {
      const tool = getTool('NonExistentFeature', 'Commerce Upgrade Assistant')
      expect(tool).toBeDefined()
      expect(tool!.toolId).toBe('502')
    })

    test('returns tool by toolName when featureName is undefined', () => {
      const tool = getTool(undefined, 'Commerce Upgrade Assistant')
      expect(tool).toBeDefined()
      expect(tool!.toolId).toBe('502')
    })

    test('returns undefined when neither featureName nor toolName match', () => {
      expect(getTool('NonExistent', 'AlsoNonExistent')).toBeUndefined()
    })

    test('returns undefined when both parameters are undefined', () => {
      expect(getTool(undefined, undefined)).toBeUndefined()
    })
  })
})
