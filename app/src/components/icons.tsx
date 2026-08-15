// Every icon in the app is inline SVG on a 24×24 grid, stroked at 1.6–1.7px
// with round caps and joins (README "Assets"). No raster assets anywhere.

export const ICONS: Record<string, string[]> = {
  home: ['M3 10.6 12 3.5l9 7.1', 'M5.5 9.6V20h13V9.6'],
  calendar: ['M4 6.5h16v14H4z', 'M8 3.5v4M16 3.5v4M4 11h16', 'M9.5 15.5l2 2 3.5-3.8'],
  people: [
    'M9 11.5a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z',
    'M2.8 20c0-3.4 2.8-5.6 6.2-5.6s6.2 2.2 6.2 5.6',
    'M16.4 5.2a3.2 3.2 0 0 1 0 6.2',
    'M18 14.7c2 .6 3.2 2.2 3.2 4.3',
  ],
  dots: ['M5 12h.01M12 12h.01M19 12h.01'],
  plus: ['M12 5.5v13M5.5 12h13'],
  bank: ['M3.5 9.5 12 4.5l8.5 5', 'M5.5 9.5V19h13V9.5', 'M9 19v-5.5h6V19', 'M3 21h18'],
  cash: ['M2.8 7.5h18.4v9H2.8z', 'M12 14.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z', 'M6 10v4M18 10v4'],
  wallet: ['M3.5 8.5h17v11h-17z', 'M3.5 8.5 5 4.8h12l1.5 3.7', 'M16 14h2'],
  check: ['M4.5 12.5l5 5 10-11'],
  shield: ['M12 3.5l7.5 3v5.6c0 4.2-3 7-7.5 8.4-4.5-1.4-7.5-4.2-7.5-8.4V6.5z', 'M8.8 12.2l2.4 2.4 4-4.6'],
  chart: ['M4 20V4', 'M4 20h16', 'M8.5 20v-6M13 20V9.5M17.5 20v-8.5'],
  upload: ['M12 16.5V4.5', 'M7.5 9 12 4.5 16.5 9', 'M4.5 19.5h15'],
  download: ['M12 4.5v12', 'M7.5 12 12 16.5 16.5 12', 'M4.5 19.5h15'],
  swap: ['M4 8.5h13l-3-3', 'M20 15.5H7l3 3'],
  list: ['M8 6.5h12M8 12h12M8 17.5h12', 'M4 6.5h.01M4 12h.01M4 17.5h.01'],
  book: ['M4.5 5.5A2 2 0 0 1 6.5 3.5H19v17H6.5a2 2 0 0 0-2 2z', 'M8 8h7M8 12h7'],
  help: [
    'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z',
    'M9.6 9.4A2.5 2.5 0 0 1 14.5 10c0 1.7-2.5 1.9-2.5 4',
    'M12 17.4h.01',
  ],
  gear: [
    'M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z',
    'M19.2 14.6a7.9 7.9 0 0 0 0-5.2l1.6-1.5-1.9-3.3-2 .8a7.7 7.7 0 0 0-4.5-2.6L12 .5h-.1l-.4 2.3a7.7 7.7 0 0 0-4.5 2.6l-2-.8L3.2 7.9l1.6 1.5a7.9 7.9 0 0 0 0 5.2L3.2 16.1 5.1 19.4l2-.8a7.7 7.7 0 0 0 4.5 2.6l.4 2.3h.1l.4-2.3a7.7 7.7 0 0 0 4.5-2.6l2 .8 1.9-3.3z',
  ],
  bell: ['M18 15.5V11a6 6 0 0 0-12 0v4.5L4.5 18h15z', 'M10 21h4'],
  chevron: ['M6.5 9.5 12 15l5.5-5.5'],
  userPlus: [
    'M10 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
    'M3 20c0-3.5 3-5.8 7-5.8 1.2 0 2.4.2 3.4.6',
    'M17.5 14v6M14.5 17h6',
  ],
  minus: ['M6 12h12'],
  receipt: ['M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8z', 'M9 8.5h6M9 12.5h6'],
  clock: ['M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z', 'M12 7.5V12l3 1.8'],
  mic: ['M12 14.5a3 3 0 0 0 3-3v-5a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z', 'M5.5 11.5a6.5 6.5 0 0 0 13 0', 'M12 18v3'],
  image: ['M4 5.5h16v13H4z', 'M8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', 'M4 15.5 9 11l4.5 4 3-2.5L20 16'],
  edit: ['M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z', 'M14.5 6.5 17.5 9.5'],
  camera: ['M4 7.5h3l1.6-2.4h6.8L17 7.5h3v12H4z', 'M12 16.8a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z'],
  qr: ['M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z', 'M14 14h2.5v2.5H14z', 'M19.5 14H20v2M14 19.5V20h6v-2.5'],
}

export function Ico({ name, size = 22, sw = 1.6 }: { name: string; size?: number; sw?: number }) {
  const d = ICONS[name] ?? ICONS.dots
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}

/** The Ganza mark: a triangular lid over a woven agaseke basket, ochre zig-zag weave. */
export function Logo({ size = 64, fill = 'var(--pri)', weave = 'var(--acc)', opacity = 1 }: {
  size?: number
  fill?: string
  weave?: string
  opacity?: number
}) {
  return (
    <svg width={size} height={size} viewBox="60 40 440 480" aria-hidden="true" style={{ opacity }}>
      <path d="M 280 69 L 420 279 L 140 279 Z" fill={fill} />
      <path d="M 128 303 L 432 303 L 376 491 L 184 491 Z" fill={fill} />
      <path
        d="M 172 401 L 208 365 L 244 401 L 280 365 L 316 401 L 352 365 L 388 401"
        fill="none"
        stroke={weave}
        strokeWidth={22}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
