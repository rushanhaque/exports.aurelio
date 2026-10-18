/* ============================================================
   optimize-images — one-shot asset pass.

   Every photograph in assets/ was shipping as a full-resolution
   PNG or camera JPEG (181 MB total, single files up to 6 MB).
   This rewrites each one as WebP, capped at the largest size it
   is ever actually displayed at (2x the CSS box, for retina).

   Run:  node scripts/optimize-images.mjs          (convert)
         node scripts/optimize-images.mjs --prune  (convert, then
                                                    delete originals)
   Re-running is cheap: an existing .webp newer than its source
   is skipped.
   ============================================================ */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

// [ path prefix, max width, quality ] — first match wins, so the more
// specific HomePage rules must precede the catch-all Collections rule.
const RULES = [
  ['assets/HomePage/PathAPieceTravels', 700, 80],   // marquee pills, ~70-200px on screen
  ['assets/HomePage/Selected works', 1200, 80],   // gallery tiles + hover pair
  ['assets/HomePage/WhereWeExcel', 1400, 80],   // atelier filmstrip panels
  ['assets/HomePage/Collections', 1200, 80],   // collection cover cards
  ['assets/Materials', 1000, 80],   // material swatches + textures
  ['assets/Collections', 1400, 78],   // product photography
]
const DEFAULT_RULE = [1400, 80]

const prune = process.argv.includes('--prune')
const SRC_RE = /\.(png|jpe?g)$/i

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name)
    return e.isDirectory() ? walk(full) : [full]
  })

const ruleFor = (file) => {
  const norm = file.split(path.sep).join('/')
  for (const [prefix, w, q] of RULES) if (norm.startsWith(prefix)) return [w, q]
  return DEFAULT_RULE
}

const mb = (n) => (n / 1048576).toFixed(1)

const files = walk('assets').filter((f) => SRC_RE.test(f))
let before = 0
let after = 0
let converted = 0
let skipped = 0

for (const file of files) {
  const out = file.replace(SRC_RE, '.webp')
  const srcStat = fs.statSync(file)
  before += srcStat.size

  // already converted and up to date
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcStat.mtimeMs) {
    after += fs.statSync(out).size
    skipped++
    continue
  }

  const [maxWidth, quality] = ruleFor(file)
  try {
    await sharp(file)
      .rotate()                                   // honour EXIF orientation before stripping it
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(out)
    after += fs.statSync(out).size
    converted++
  } catch (err) {
    console.error(`  !! ${file}: ${err.message}`)
    after += srcStat.size
  }
}

console.log(`\nconverted ${converted}, skipped ${skipped} (already current)`)
console.log(`${mb(before)} MB  ->  ${mb(after)} MB   (${(100 - (after / before) * 100).toFixed(1)}% smaller)`)

if (prune) {
  let removed = 0
  for (const file of files) {
    if (fs.existsSync(file.replace(SRC_RE, '.webp'))) {
      fs.unlinkSync(file)
      removed++
    }
  }
  console.log(`pruned ${removed} original PNG/JPEG files`)
}

/* ---- dimension manifest -------------------------------------------------
   An <img> with no width/height and `height: auto` has zero height until it
   decodes. A lazy image inside a box that collapsed to zero never intersects
   the viewport, so it never loads, so the box stays collapsed — a deadlock
   that silently emptied the Selected Works grid. Shipping real dimensions
   reserves the right space up front, which also means no layout shift.
   Scoped to the folders whose components actually read it — the whole 355-entry
   map would be ~27kB of dead weight in the Home chunk. Add a prefix here when a
   new component needs real dimensions.                                        */
const SIZED = ['assets/HomePage/Selected works']

const manifest = {}
for (const file of walk('assets').filter((f) => /\.webp$/i.test(f))) {
  const key = file.split(path.sep).join('/')
  if (!SIZED.some((prefix) => key.startsWith(prefix))) continue
  const { width, height } = await sharp(file).metadata()
  manifest[key] = [width, height]
}
fs.writeFileSync('src/data/image-sizes.json', JSON.stringify(manifest, null, 0) + '\n')
console.log(`wrote src/data/image-sizes.json (${Object.keys(manifest).length} entries)`)
