/**
 * Triage state-machine matrix (review round 1, B6): every (status, action)
 * pair must be explicitly allowed or denied — no accidental transitions on
 * running tasks.
 */
import { describe, expect, test } from 'vitest'
import { canTransition, type TriageAction } from '../src/state-machine.ts'

const STATUSES = [
  'pending-review', 'queued', 'deferred', 'dropped', 'preflight', 'running',
  'done', 'failed', 'stale', 'timeout', 'cancelled',
] as const

const ACTIONS: TriageAction[] = ['approve', 'defer', 'drop', 'cancel', 'retry', 'delete', 'restore', 'choose-candidate']

const ALLOWED: Record<TriageAction, string[]> = {
  approve: ['pending-review', 'deferred'],
  defer: ['pending-review', 'queued'],
  drop: ['pending-review', 'queued', 'deferred', 'done', 'failed', 'stale', 'timeout', 'cancelled', 'dropped'],
  cancel: ['queued', 'pending-review', 'deferred'],
  retry: ['failed', 'timeout', 'stale', 'cancelled'],
  restore: ['dropped'],
  'choose-candidate': ['done'],
  delete: ['pending-review', 'queued', 'deferred', 'dropped', 'done', 'failed', 'stale', 'timeout', 'cancelled'],
}

describe('canTransition', () => {
  for (const action of ACTIONS) {
    test(`action ${action}`, () => {
      for (const status of STATUSES) {
        const expected = ALLOWED[action].includes(status)
        expect(canTransition(status, action), `${status} → ${action}`).toBe(expected)
      }
    })
  }

  test('unknown statuses are never allowed for state-changing actions', () => {
    expect(canTransition('mystery', 'approve')).toBe(false)
    expect(canTransition('mystery', 'defer')).toBe(false)
    expect(canTransition('mystery', 'retry')).toBe(false)
    expect(canTransition('mystery', 'restore')).toBe(false)
  })

  test('running/preflight are locked against drop and delete', () => {
    expect(canTransition('running', 'drop')).toBe(false)
    expect(canTransition('preflight', 'delete')).toBe(false)
    expect(canTransition('running', 'delete')).toBe(false)
  })
})
