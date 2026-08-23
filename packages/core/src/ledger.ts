/**
 * Cost ledger: budget bookkeeping / overspend policy / savings aggregation.
 * Filled at T2.7. See PLAN §7.1.
 */
export interface LedgerEntry {
  taskId: string
  when: string
  yuan: number
  savedYuan: number
}

export function summarize(_entries: LedgerEntry[]): unknown {
  throw new Error('lowtide-core: summarize not implemented until T2.7')
}
