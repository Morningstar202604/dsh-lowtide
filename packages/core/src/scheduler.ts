/**
 * Scheduler decisions: due-time checks / overdue / window fit, injected clock.
 * No timer implementation lives here. Filled at T1.4. See PLAN §7.1.
 */
export function isOverdue(_task: unknown, _now: Date): boolean {
  throw new Error('lowtide-core: isOverdue not implemented until T1.4')
}
