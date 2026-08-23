import { describe, expect, test } from 'vitest'
import { digest } from '../src/digest.ts'
import type { Task } from '../src/model.ts'

function task(id: string, workspace: string, status: Task['status']): Task {
  return {
    id,
    prompt: `task ${id}`,
    files: [],
    workspace,
    priority: 1,
    permissionPreset: 'lt-standard',
    status,
    createdAt: new Date().toISOString(),
  }
}

describe('digest', () => {
  test('groups by workspace in insertion order', () => {
    const view = digest([
      task('a', 'E:/x', 'queued'),
      task('b', 'E:/x', 'pending-review'),
      task('c', 'D:/y', 'queued'),
    ])
    expect(view.groups.map((g) => g.workspace)).toEqual(['E:/x', 'D:/y'])
    expect(view.groups[0].tasks.map((t) => t.id)).toEqual(['a', 'b'])
    expect(view.groups[1].tasks.map((t) => t.id)).toEqual(['c'])
  })

  test('excludes dropped and cancelled tasks', () => {
    const view = digest([
      task('a', 'E:/x', 'queued'),
      task('b', 'E:/x', 'dropped'),
      task('c', 'E:/x', 'cancelled'),
    ])
    expect(view.groups[0].tasks.map((t) => t.id)).toEqual(['a'])
  })

  test('empty queue digests to no groups', () => {
    const view = digest([])
    expect(view.groups).toEqual([])
  })
})
