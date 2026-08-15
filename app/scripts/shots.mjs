// Walks the app and writes a screenshot of each screen, so the build can be
// compared against the design bundle. Run against `vite preview`:
//   node scripts/shots.mjs [outDir] [baseUrl]
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const out = process.argv[2] ?? '/tmp/ganza-shots'
const base = process.argv[3] ?? 'http://localhost:4173/'

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await mkdir(out, { recursive: true })

const shot = async (name) => {
  await page.waitForTimeout(320)
  await page.screenshot({ path: join(out, `${name}.png`) })
  console.log(name)
}

const tapText = async (text, opts = {}) => {
  await page.getByText(text, { exact: false }).first().click(opts)
  await page.waitForTimeout(280)
}

await page.goto(base, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(500)

// Entry
await shot('01-tour-1')
await tapText('Continue')
await shot('02-tour-2')
await tapText('Continue')
await tapText('Get started')
await shot('03-signin')
await page.getByPlaceholder('0788 640 213').fill('0788640213')
await tapText('Sign in', { position: { x: 100, y: 20 } })
await page.getByRole('button', { name: 'Sign in' }).last().click()
await page.waitForTimeout(300)
await shot('04-pin')
for (const d of ['1', '2', '3', '4']) await page.getByRole('button', { name: d, exact: true }).click()
await page.waitForTimeout(1400)

// Tabs
await shot('05-home')
await page.getByRole('button', { name: 'Meeting' }).last().click()
await shot('06-meeting')
await page.getByRole('button', { name: 'Members' }).last().click()
await shot('07-members')
await page.getByRole('button', { name: 'More' }).last().click()
await shot('08-more')

// Pushed pages, reached from More
const fromMore = [
  ['Approvals', '09-approvals'],
  ['Fines owed', '10-fines'],
  ['Past meetings', '11-past'],
  ['Analytics', '12-analytics'],
  ['Export sheet', '13-export'],
  ['Ikimina settings', '14-ikimina-settings'],
  ['App settings', '15-app-settings'],
  ['Help / report', '16-help'],
]
for (const [label, name] of fromMore) {
  await page.getByRole('button', { name: new RegExp(`^${label}`) }).first().click()
  await shot(name)
  await page.getByRole('button', { name: 'Back' }).click()
  await page.waitForTimeout(260)
}

// Profile
await page.getByRole('button', { name: /Habimana Jean Bosco/ }).first().click()
await shot('17-profile')
await page.getByRole('button', { name: 'Back' }).click()
await page.waitForTimeout(260)

// The four states, from App settings → Preview states
// A page replaces a page and back returns to the tab, so App settings is
// re-entered for each state rather than "returned to".
for (const [label, name] of [
  ['You are offline', '18-offline'],
  ['That did not go through', '19-failed'],
  ['Nothing written yet', '20-empty'],
  ['This ikimina is closed', '21-closed'],
]) {
  await page.getByRole('button', { name: /^App settings/ }).first().click()
  await page.waitForTimeout(260)
  await page.getByRole('button', { name: label }).first().click()
  await shot(name)
  await page.getByRole('button', { name: 'Back' }).click()
  await page.waitForTimeout(260)
}

// Treasurer flows from Home
await page.getByRole('button', { name: 'Home' }).last().click()
await page.waitForTimeout(260)
await page.getByRole('button', { name: /Add payment/ }).first().click()
await shot('22-add-payment')
await page.getByRole('button', { name: 'Back' }).click()
await page.waitForTimeout(260)
await page.getByRole('button', { name: /Deposit to bank/ }).first().click()
await shot('23-deposit')
await page.getByRole('button', { name: 'Back' }).click()
await page.waitForTimeout(260)
await page.getByRole('button', { name: /Offer loan/ }).first().click()
await shot('24-loan')
await page.getByRole('button', { name: 'Back' }).click()
await page.waitForTimeout(260)

// Balance detail pages
await page.getByRole('button', { name: /Group savings/ }).first().click()
await shot('25-balance')
await page.getByRole('button', { name: 'Back' }).click()
await page.waitForTimeout(260)

// Contribution sheet, from the roll-call
await page.getByRole('button', { name: 'Meeting' }).last().click()
await page.waitForTimeout(260)
await page.getByRole('button', { name: /Twagirayezu Innocent/ }).first().click()
await shot('26-contribution-sheet')
await page.keyboard.press('Escape')

// Member history
await page.getByRole('button', { name: 'Members' }).last().click()
await page.waitForTimeout(300)
await page.getByRole('button', { name: /Niyonzima Eric/ }).first().click()
await shot('27-member-history')
await page.getByRole('button', { name: 'Back' }).click()
await page.waitForTimeout(260)

// Add member
await page.getByRole('button', { name: '+ Add' }).first().click()
await shot('28-add-member')
await page.getByRole('button', { name: 'Back' }).click()
await page.waitForTimeout(260)

// Dark mode + Kinyarwanda
await page.getByRole('button', { name: 'More' }).last().click()
await page.waitForTimeout(260)
await page.getByRole('button', { name: /^App settings/ }).first().click()
await page.waitForTimeout(260)
await page.getByRole('switch', { name: 'Dark mode' }).click()
await page.waitForTimeout(300)
await page.getByRole('button', { name: 'RW' }).first().click()
await shot('29-dark-rw-settings')
await page.getByRole('button', { name: 'Back' }).click()
await page.waitForTimeout(260)
await page.getByRole('button', { name: /Ahabanza|Home/ }).last().click()
await shot('30-dark-rw-home')

await browser.close()
console.log('done →', out)
