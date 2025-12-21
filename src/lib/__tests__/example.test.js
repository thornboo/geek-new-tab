import { describe, it, expect } from 'vitest'

describe('Vitest Configuration', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should support async tests', async () => {
    const result = await Promise.resolve(true)
    expect(result).toBe(true)
  })
})
