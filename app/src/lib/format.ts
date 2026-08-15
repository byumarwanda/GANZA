/** Thousands separators, always. Amounts read `12,500 RWF` in both languages. */
export function fmt(n: number): string {
  return (typeof n === 'number' && isFinite(n) ? n : 0).toLocaleString('en-US')
}

/** Up to two initials, for an avatar circle. */
export function ini(n: string): string {
  return n.split(' ').map((w) => w[0]).slice(0, 2).join('')
}

/** `Habimana Jean Bosco` → `Habimana J.` — fits a picker row on one line. */
export function short(n: string): string {
  const p = n.split(' ')
  return p[0] + ' ' + (p[1] ? p[1][0] + '.' : '')
}

/** `Today 17:48`, for stamping a decision. */
export function stamp(): string {
  const d = new Date()
  return 'Today ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

/** Strip everything but digits — every amount field is numeric-only. */
export function digitsOnly(v: string): string {
  return v.replace(/[^0-9]/g, '')
}
