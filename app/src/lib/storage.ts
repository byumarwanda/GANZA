import type { AppState } from './types'
import { initialState } from './data'

const KEY = 'ganza.state.v1'

/** Session-only fields. A reload should not drop you back mid-PIN or mid-form. */
const TRANSIENT: (keyof AppState)[] = [
  // A refresh returns you to the main screen rather than halfway through a
  // form you have forgotten you opened.
  'page',
  'busy', 'busyKey', 'pin', 'toast', 'confirm', 'confirmId', 'capture', 'receiptView',
  'groupPickerOn', 'sheetId', 'sheetStep', 'otherAmt', 'ikEdit', 'ikEditVal', 'ikEditKey',
  'expFormOn', 'ruleFormOn', 'voiceRec', 'helpRec', 'fineOpen', 'pastExp',
]

export function load(): AppState {
  const base = initialState()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const saved = JSON.parse(raw) as Partial<AppState>
    const merged = { ...base, ...saved }
    for (const k of TRANSIENT) (merged as Record<string, unknown>)[k] = base[k]
    return merged
  } catch {
    // A corrupt or unreadable store must never stop the app opening — the
    // logbook matters more than the last session's scroll position.
    return base
  }
}

export function save(st: AppState): void {
  try {
    const out: Record<string, unknown> = { ...st }
    for (const k of TRANSIENT) delete out[k]
    localStorage.setItem(KEY, JSON.stringify(out))
  } catch {
    // Storage full or blocked (private mode). The app keeps working in memory.
  }
}

export function clear(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to do */
  }
}
