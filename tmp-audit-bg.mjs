import { chromium } from 'playwright'

const slugs = ['ashen-press','aurora','beams','bubbles','caustics','cells','contour','dot-matrix','dots','globe-mesh','grid-lines','halftone','hex','mesh','mosaic','orbital-sphere','plasma','rain','ripple-grid','silk','spectrum','stars','threads','tunnel','vortex','waves']

const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })

for (const slug of slugs) {
  errors.length = 0
  try {
    await page.goto(`http://localhost:5190/docs/backgrounds/${slug}`, { waitUntil: 'networkidle', timeout: 20000 })
  } catch { errors.push('goto timeout') }
  await page.waitForTimeout(2500)
  const info = await page.evaluate(() => {
    const canvases = [...document.querySelectorAll('canvas')]
    const c = canvases[0]
    return {
      canvases: canvases.length,
      size: c ? `${c.width}x${c.height}` : '-',
      h1: document.querySelector('h1')?.textContent?.slice(0, 40) ?? '-',
      body: document.body.innerText.includes('sans apercu') ? 'SANS-APERCU' : '',
    }
  })
  await page.screenshot({ path: `.audit-bg/${slug}.png` })
  console.log(`${slug}: canvases=${info.canvases} ${info.size} h1="${info.h1}" ${info.body} ${errors.length ? 'ERREURS: ' + errors.join(' | ') : ''}`)
}
await browser.close()
