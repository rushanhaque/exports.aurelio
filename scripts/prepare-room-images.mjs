import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const originals = path.join(root, 'output/imagegen/finish-for-every-room')
const output = path.join(root, 'public/images/bulk/rooms')
const manifest = JSON.parse(await fs.readFile(path.join(originals, 'prompts.json'), 'utf8'))
await fs.mkdir(output, { recursive: true })

for (const asset of manifest.assets) {
  const original = path.join(originals, `${asset.slug}.png`)
  try { await fs.access(original) }
  catch { await fs.copyFile(asset.source, original) }
  for (const width of [480, 800, 1440]) {
    const destination = path.join(output, `${asset.slug}-v1-${width}.webp`)
    await sharp(original)
      .resize({ width, height: Math.round(width * 9 / 16), fit: 'cover' })
      .webp({ quality: 84, effort: 6 })
      .toFile(destination)
    console.log(`${path.relative(root, destination)}: ${Math.round((await fs.stat(destination)).size / 1024)} KiB`)
  }
}
