import type { UssdNode } from './types'

// 00-CORE.md §2. A USSD screen is 182 bytes on most Rwandan carriers; the
// handset wraps it at 26 characters, and the design gets 7 lines once wrapped.
export const MAX_LINES = 7
export const MAX_CHARS = 26
export const MAX_BYTES = 182

/** Every line the handset will print, before wrapping. */
export function logicalLines(n: UssdNode): string[] {
  const out: string[] = [n.head]
  for (const b of n.body ?? []) out.push(...b.split('\n'))
  for (const o of n.opts ?? []) out.push(`${o.k} ${o.label}`)
  if (n.input) out.push(n.input.prompt)
  if (n.foot) out.push(n.foot)
  return out
}

/** How many rows one logical line takes once the handset wraps it. */
export function wrappedRows(line: string, width = MAX_CHARS): number {
  const words = line.split(' ')
  const rows: string[] = []
  let row = ''
  for (const w of words) {
    if (!row.length) row = w
    else if ((row + ' ' + w).length <= width) row += ' ' + w
    else { rows.push(row); row = w }
  }
  if (row.length) rows.push(row)
  return rows.length || 1
}

export interface Budget {
  rows: number
  bytes: number
  /** Past what the carrier will actually send. The screen gets truncated. */
  over: boolean
  /** Past the seven-line design target, but still deliverable — the handset
      scrolls. Worth seeing; not a failure. */
  overTarget: boolean
}

export function measure(n: UssdNode): Budget {
  const logical = logicalLines(n)
  const rows = logical.reduce((a, l) => a + wrappedRows(l), 0)
  const bytes = new TextEncoder().encode(logical.join('\n')).length
  return { rows, bytes, over: bytes > MAX_BYTES, overTarget: rows > MAX_LINES }
}
