// Renders the app icons from the Ganza mark using the headless Chromium that
// ships with this environment. Run with `node scripts/make-icons.mjs`.
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', 'public', 'icons')

const mark = (scale = 1) => `
  <g transform="translate(${(1 - scale) * 280} ${(1 - scale) * 280}) scale(${scale})">
    <path d="M 280 69 L 420 279 L 140 279 Z" fill="#5A55D6"/>
    <path d="M 128 303 L 432 303 L 376 491 L 184 491 Z" fill="#5A55D6"/>
    <path d="M 172 401 L 208 365 L 244 401 L 280 365 L 316 401 L 352 365 L 388 401"
          fill="none" stroke="#D69B2D" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`

// A maskable icon must survive a circular crop, so the mark is inset.
const page = (size, scale, bg) => `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0}svg{display:block}</style>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 560 560">
  <rect width="560" height="560" fill="${bg}"/>
  ${mark(scale)}
</svg>`

const targets = [
  { file: 'icon-192.png', size: 192, scale: 1, bg: '#F7F6FB' },
  { file: 'icon-512.png', size: 512, scale: 1, bg: '#F7F6FB' },
  { file: 'icon-512-maskable.png', size: 512, scale: 0.72, bg: '#F7F6FB' },
  { file: 'apple-touch-icon.png', size: 180, scale: 1, bg: '#F7F6FB' },
]

// This environment ships Chromium at a fixed path; do not download another.
const executablePath = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ executablePath })
await mkdir(out, { recursive: true })
for (const t of targets) {
  const p = await browser.newPage({ viewport: { width: t.size, height: t.size } })
  await p.setContent(page(t.size, t.scale, t.bg))
  await writeFile(join(out, t.file), await p.screenshot({ omitBackground: false }))
  await p.close()
  console.log('wrote', t.file)
}
await browser.close()
