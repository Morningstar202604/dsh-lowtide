/**
 * Triage state-machine (review round 1, B6): the transition table guarding
 * every /tasks/:id/:action route. Kept dependency-free so the full matrix is
 * unit-testable without pulling the host bundle.
 */
/** Triage actions accepted by the /tasks/:id/:action routes. */
export type TriageAction = 'approve' | 'defer' | 'drop' | 'cancel' | 'retry' | 'delete' | 'restore' | 'choose-candidate'

/**
 * A transition is rejected unless the current status allows it — otherwise a
 * running task could be re-queued behind the agent's back and the persisted
 * state would fight the live execution.
 */
export function canTransition(status: string, action: TriageAction): boolean {
  switch (action) {
    case 'approve': return status === 'pending-review' || status === 'deferred'
    case 'defer': return status === 'pending-review' || status === 'queued'
    case 'drop': return status !== 'running' && status !== 'preflight'
    case 'cancel': return status === 'queued' || status === 'pending-review' || status === 'deferred'
    case 'retry': return status === 'failed' || status === 'timeout' || status === 'stale' || status === 'cancelled'
    case 'restore': return status === 'dropped'
    case 'choose-candidate': return status === 'done'
    case 'delete': return status !== 'running' && status !== 'preflight'
  }
}
