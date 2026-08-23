/**
 * Deterministic digest: workspace grouping, zero LLM (PLAN §7.1).
 * Powers the queue panel grouping. Estimate fields were removed — the UI no
 * longer shows task-level cost/time estimates (user review: 不准且无用).
 */
import type { Task } from './model.ts'

export interface WorkspaceGroup {
  workspace: string
  tasks: Task[]
}

export interface DigestView {
  groups: WorkspaceGroup[]
}

/** Group tasks by workspace in insertion order. */
export function digest(tasks: Task[]): DigestView {
  const groups: WorkspaceGroup[] = []
  const byWorkspace = new Map<string, WorkspaceGroup>()
  for (const task of tasks) {
    if (task.status === 'dropped' || task.status === 'cancelled') continue
    let group = byWorkspace.get(task.workspace)
    if (group === undefined) {
      group = { workspace: task.workspace, tasks: [] }
      byWorkspace.set(task.workspace, group)
      groups.push(group)
    }
    group.tasks.push(task)
  }
  return { groups }
}
