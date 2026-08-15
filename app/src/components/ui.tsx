import { useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'

// The recipes from DEVELOPER.md §4. Everything else is written inline at the
// point of use, because in this design almost every surface is measured for the
// one place it appears.

/** The small grey all-caps header that breaks a scroll into groups.
    The 4px horizontal margin sits it against the card's text column, not the container edge. */
export function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 13, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.08em',
        textTransform: 'uppercase', margin: '36px 4px 12px', ...style,
      }}
    >
      {children}
    </div>
  )
}

/** §4.2 — a card that holds rows. Rows carry their own 0.5px separators. */
export function GroupedCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: 14, overflow: 'hidden', ...style }}>{children}</div>
  )
}

/** §4.4 — full-width primary action.
    Disabled is a colour change only: the button keeps its size and stays visible,
    so the user can see what they are working toward. */
export function PrimaryButton({
  onClick, disabled, children, height = 56, radius = 14, style,
}: {
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  height?: number
  radius?: number
  style?: CSSProperties
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled || undefined}
      style={{
        width: '100%', height, borderRadius: radius, border: 'none',
        background: disabled ? 'var(--chip)' : 'var(--pri)',
        color: disabled ? 'var(--sub)' : 'var(--priink)',
        fontSize: 17, fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

/** §4.5 — outlined counterpart. */
export function SecondaryButton({
  onClick, children, height = 52, radius = 14, style,
}: {
  onClick?: () => void
  children: ReactNode
  height?: number
  radius?: number
  style?: CSSProperties
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', height, borderRadius: radius, background: 'var(--card)',
        border: '2px solid var(--line)', color: 'var(--ink)', fontSize: 17, fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

/** §4.6 — status always travels as ink on its own background, never colour alone. */
export function StatusPill({ tone, children }: { tone: 'ok' | 'red' | 'amber' | 'chip'; children: ReactNode }) {
  const fg = tone === 'chip' ? 'var(--sub)' : `var(--${tone})`
  const bg = tone === 'chip' ? 'var(--chip)' : `var(--${tone}bg)`
  return (
    <span style={{ borderRadius: 99, padding: '3px 9px', fontSize: 13, fontWeight: 500, color: fg, background: bg }}>
      {children}
    </span>
  )
}

/** A circular initials avatar. */
export function Avatar({
  children, size = 46, bg = 'var(--chip)', fg = 'var(--pri)', fontSize = 15, fontWeight = 500,
}: {
  children: ReactNode
  size?: number
  bg?: string
  fg?: string
  fontSize?: number
  fontWeight?: number
}) {
  return (
    <span
      style={{
        width: size, height: size, borderRadius: '50%', background: bg, color: fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize, fontWeight, flex: 'none',
      }}
    >
      {children}
    </span>
  )
}

/** A modal sheet over the current screen. Dismisses by tapping outside or an
    explicit Cancel — sheets are not pages and do not use the back button. */
export function Sheet({
  onClose, children, z = 40, padding = '14px 24px 32px',
}: {
  onClose: () => void
  children: ReactNode
  z?: number
  padding?: string
}) {
  // Tap outside dismisses on a phone; Escape is the same gesture on a keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, zIndex: z, background: 'rgba(16,19,34,.5)' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: z + 1, background: 'var(--card)',
          borderRadius: '26px 26px 0 0', padding, animation: 'rise .18s ease',
          paddingBottom: `calc(${padding.split(' ')[2] ?? '32px'} + env(safe-area-inset-bottom))`,
          maxHeight: '86%', overflowY: 'auto',
        }}
      >
        <div style={{ width: 44, height: 5, borderRadius: 99, background: 'var(--line)', margin: '0 auto 20px' }} />
        {children}
      </div>
    </>
  )
}

/** The numbered step label above each part of a form. */
export function StepLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--sub)', margin: '4px 0 8px', ...style }}>
      {children}
    </div>
  )
}

/** A card of prose or a single figure. §4.3 */
export function ContentCard({
  children, style, radius = 16, padding = 18,
}: {
  children: ReactNode
  style?: CSSProperties
  radius?: number
  padding?: number | string
}) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: radius, padding, ...style }}>{children}</div>
  )
}

/** A big figure with its RWF unit set small beside it. */
export function Amount({ value, unit = 'RWF', size = 34 }: { value: string; unit?: string; size?: number }) {
  return (
    <div
      style={{
        fontSize: size, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.03em',
        fontVariantNumeric: 'tabular-nums', marginTop: 6,
      }}
    >
      {value} <span style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 400 }}>{unit}</span>
    </div>
  )
}

/** The row separator used inside every grouped card. Half a pixel, not one. */
export const hairline = '0.5px solid var(--line)'
