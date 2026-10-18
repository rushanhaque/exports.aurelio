// Reproduce the missing editorial sections from the owner's Aurelio_Ecom site.
// Only public imagery, component source and styles are read from that project.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { transform } from 'esbuild'
import postcss from 'postcss'

const destination = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.resolve(process.argv[2] || '../Aurelio_Ecom')
const { format } = await import(pathToFileURL(path.join(source, 'node_modules/prettier/index.mjs')).href)
const target = path.join(destination, 'src/components/bulk')
await fs.mkdir(target, { recursive: true })
const read = (name) => fs.readFile(path.join(source, 'app', name), 'utf8')
async function jsx(name, content) {
  const result = await transform(content, { loader: 'tsx', jsx: 'preserve', target: 'esnext', legalComments: 'inline' })
  await fs.writeFile(path.join(target, name + '.jsx'), await format(result.code, { parser: 'babel', singleQuote: true, semi: false }))
}
function adapt(content) {
  return content.replace(/import "\.\.\/[^"\n]+\.css";\r?\n/g, '')
    .replaceAll('from "react-router"', 'from "./navigation"')
    .replaceAll('from "../lib/brand-content"', 'from "./content"')
    .replaceAll('from "../lib/home-content"', 'from "./content"')
    .replaceAll('/images/', '/images/bulk/')
}

for (const name of ['atelier-experiments', 'light-study', 'material-atelier', 'motion-text']) {
  await jsx(name, adapt(await read(`components/${name}.tsx`)))
}
const brandContent = await read('lib/brand-content.ts')
const content = await transform(brandContent + '\n' + await read('lib/home-content.ts'), {loader:'ts',target:'es2019'})
await fs.writeFile(path.join(target, 'content.js'), content.code)

// Retain the source form's preview, image preparation, controls and markup.
// Send the prepared files together with the enquiry to this site's service.
let brief = adapt(await read('components/brief-studio.tsx'))
brief = brief.replace('import { request } from "../lib/store";', 'import { sendEnquiry } from "./enquiries";')
brief = brief.replace(/const designPreview = \(\) =>[\s\S]*?;\r?\n/, '')
brief = brief.replace(/async function upload\([\s\S]*?\r?\n}\r?\n/, '')
brief = brief.replace('id?: string;', 'blob?: Blob;')
brief = brief.replace(/  const \[key, setKey\] = useState\([^\n]+\);\r?\n/, '')
brief = brief.replace(/\.then\(\(blob\) => \(designPreview\(\) \? "preview" : upload\(blob\)\)\)\s*\.then\(\(id\) => patch\(picture, \{ status: "ready", id \}\)\)/, '.then((blob) => patch(picture, { status: "ready", blob }))')
brief = brief.replace('One picture did not send.', 'One picture could not be prepared.')
const begin = brief.indexOf('      const result = await request(')
const end = brief.indexOf('\n      setSent(', begin)
if (begin < 0 || end < 0) throw new Error('Source brief submission changed; review the adapter.')
brief = brief.slice(0, begin) + `      form.set("product", \`Bespoke idea\${metal ? \` · \${metal}\` : ""}\`);
      form.set("preferredMetal", metal);
      form.set("_subject", "Aurelio — bespoke idea");
      await sendEnquiry(form, pictures);
` + brief.slice(end)
brief = brief.replace('reference: result.reference, ', '')
brief = brief.replace('sent.reference', '"ENQUIRY SENT"')
brief = brief.replace(/    setKey\([^\n]+\);\r?\n/, '')
brief = brief.replace('accept="image/*"', 'accept="image/jpeg,image/png,image/webp"')
brief = brief.replace('              type="file"', '              type="file"\n              aria-label="Add photos, drawings or sketches"')
await jsx('brief-studio', brief)

let scenes = adapt(await read('components/home-sections.tsx'))
scenes = scenes.replace('import { shopLink, shopIsExternal } from "../lib/brand";', 'const shopLink = "/collections";\nconst shopIsExternal = false;')
scenes = scenes.replace('from "./storytelling"', 'from "./reading-statement"')
scenes = scenes.replace('to="/bulk-orders#enquire"', 'to="#enquire"')
await jsx('home-sections', scenes)
let story = await read('components/storytelling.tsx')
await jsx('reading-statement', story.slice(story.indexOf('export function ReadingStatement()')))

// Keep the source form and FAQ. The dedicated audience imagery lives in
// TradeAudience.jsx so re-importing the source cannot replace those assets.
const bulk = await read('routes/bulk.tsx')
const enquiry = bulk.slice(bulk.indexOf('        <section\r\n          className="enquiry-feature'), bulk.indexOf('        {!!tradeAnswers.length'))
const faq = bulk.slice(bulk.indexOf('          <section className="section container trade-faq">'), bulk.indexOf('        <CommissionScene />')).replace(/\s*\)\}\s*$/, '')
if (!enquiry || !faq) throw new Error('Source trade section boundaries changed.')
const imports = `import { useState } from 'react';
import { ArrowUpRight, MessageCircle, BookOpen, Plus } from 'lucide-react';
import { Link } from './navigation';
import { Field, Success } from './ui';
import { Words } from './motion-text';
import { collections } from './content';
import { sendEnquiry } from './enquiries';
const brand = { tradeEmail: 'saud@aurelio.in', telephone: 'tel:+917817976738', phone: '+91 78179 76738' };
const whatsappBrief = 'https://wa.me/917817976738?text=' + encodeURIComponent("Hello Aurelio — I'd like to discuss a bulk / trade enquiry.");
`
const faqSource = await read('lib/help-content.ts')
const questionNames = ['Is there a minimum order quantity?', 'What are your lead times?', 'Can I customize a piece?', 'Do you ship internationally?']
const answers = [...faqSource.matchAll(/\[\s*"([^"\n]+)",\s*"([^"\n]+)",?\s*\]/g)].filter(m=>questionNames.includes(m[1])).map(m=>[m[1],m[2]])
answers.sort((a,b)=>questionNames.indexOf(a[0])-questionNames.indexOf(b[0]))
await jsx('trade-sections', adapt(imports + `
const tradeAnswers = ${JSON.stringify(answers)};
export { TradeAudience } from './TradeAudience';
export function TradeQuestions() { return (${faq}); }
export function TradeEnquiry() {
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [reference,setReference] = useState('');
  const params = new URLSearchParams(window.location.search);
  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const data = new FormData(event.currentTarget);
      data.set('_subject', 'Aurelio — trade enquiry');
      await sendEnquiry(data);
      setReference('Enquiry sent');
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return (${enquiry.replace('We’ve saved your enquiry.', 'Your enquiry is with the atelier.').replace('<p className="reference">{reference}</p>', '').replace('Keep this reference. We aim to reply within two working days.', 'We aim to reply within two working days.')});
}
`))

// Preserve the source cascade, scoped to the imported sections. Drop rules
// that only style unrelated shop, checkout, account, header or footer screens.
const styles = ['tokens','styles','interaction','brand-content','refinement','interaction-v2','legibility','atelier-story','atelier-finish','storefront','enquiry-card','bulk-sections','storytelling','material-atelier','atelier-experiments','brief-studio','immersive','home-hero']
const relevant = /^(?:bulk-|mx-|experiment|anatomy-|lens-|room-|light-|lab-|brief|opening-|orbit-art|statement|story-reading|reading-word|commission-|trade-|serve-|enquiry-|form-|field|checkbox-label|brand-contact|honey-field|editorial-form|success|reference|muted|sr-only|text-link|button|section|container|interaction-note|w$)/
const css = []
for (const name of styles) {
  const root = postcss.parse(await read(name + '.css'))
  root.walkComments(node => node.remove())
  root.walkAtRules('import', node => node.remove())
  root.walkRules(rule => {
    if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return
    const selectors = rule.selectors.filter(selector => {
      const classes = [...selector.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map(m=>m[1])
      return !classes.length || classes.some(name=>relevant.test(name))
    })
    if (!selectors.length) { rule.remove(); return }
    rule.selectors = selectors.map(selector => {
      const scoped = selector.replace(/^html\s+/, '').replace(/^body(?=[\s[.:]|$)/, ':scope').replace(/^html(?=[\s[.:]|$)/, ':scope').replaceAll(':root', ':scope')
      return scoped.startsWith(':scope') ? scoped.replace(':scope', '.imported-bulk') : ':where(.imported-bulk) ' + scoped
    })
  })
  root.walkAtRules(node => { if (node.nodes && !node.nodes.length) node.remove() })
  css.push(`/* Source: Aurelio_Ecom/app/${name}.css */\n` + root.toString())
}
const sheet = css.join('\n').replaceAll('"Cormorant Garamond"', '"Collection Cormorant"').replaceAll('"Manrope"', '"Collection Manrope"')
await fs.writeFile(path.join(target, 'source.css'), sheet)

const imageRoot = path.join(source, 'public/images')
const outRoot = path.join(destination, 'public/images/bulk')
let assetCount = 0
async function copyImage(relative) {
  const dest = path.join(outRoot, relative)
  await fs.mkdir(path.dirname(dest), {recursive:true})
  await fs.copyFile(path.join(imageRoot, relative), dest)
  assetCount++
}
for (const name of await fs.readdir(path.join(imageRoot,'brand'))) {
  if (/-(480|800|1440)\.webp$/.test(name)) await copyImage('brand/' + name)
}
for (const name of ['sculpture-480.webp','sculpture-800.webp','sculpture-1440.webp','original/Lamptwo-480.webp','original/Lamptwo-960.webp','original/LamptwoHover-480.webp','original/LamptwoHover-960.webp','finishes/hammered-brass-1200.webp','finishes/hammered-brass-1800.webp']) await copyImage(name)
for (const [family, file] of [['manrope','manrope-latin-500-normal.woff2'],['manrope','manrope-latin-600-normal.woff2'],['cormorant-garamond','cormorant-garamond-latin-500-normal.woff2']]) {
  await fs.copyFile(path.join(source, 'node_modules/@fontsource',family,'files',file), path.join(destination,'public/fonts/collection-story',file))
}
console.log(`Imported source components, scoped styles and ${assetCount} public images.`)
