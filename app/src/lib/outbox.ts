// BEHAVIOR.md §5 — the group meets where there is often no data.
//
// Every write is recorded here first and replayed when the connection comes back.
// Recording a contribution must never block on the network, so nothing in the UI
// awaits this: the entry is already in state by the time it is queued.
//
// There is no server yet. `flush` therefore marks entries sent rather than
// posting them. When the API lands, replace the body of `send` — the queue,
// the ordering and the retry loop above it do not need to change.

export interface OutboxEntry {
  id: string
  /** What happened, in the app's own vocabulary: `contribution`, `deposit`, `approval`… */
  kind: string
  /** Enough detail to replay the write server-side. */
  payload: unknown
  at: number
  tries: number
}

const KEY = 'ganza.outbox.v1'

function read(): OutboxEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as OutboxEntry[]
  } catch {
    return []
  }
}

function write(q: OutboxEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(q))
  } catch {
    /* storage unavailable — the write still lives in app state */
  }
}

export function enqueue(kind: string, payload: unknown): void {
  const q = read()
  q.push({ id: `${Date.now()}-${q.length}`, kind, payload, at: Date.now(), tries: 0 })
  write(q)
}

export function pending(): number {
  return read().length
}

async function send(_entry: OutboxEntry): Promise<void> {
  // No backend yet. Replace with the real POST when the API exists.
  return
}

/** Replay everything queued, oldest first. Stops on the first failure so ordering holds. */
export async function flush(): Promise<number> {
  if (!navigator.onLine) return 0
  const q = read()
  let sent = 0
  while (q.length) {
    const entry = q[0]
    try {
      await send(entry)
      q.shift()
      sent++
      write(q)
    } catch {
      entry.tries++
      write(q)
      break
    }
  }
  return sent
}
