import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { sendEnquiry, ENQUIRY_ENDPOINT } from '../src/components/bulk/enquiries.js'
import { materials, collections } from '../src/components/bulk/content.js'

// Verify the portability boundary without sending an enquiry or uploading files.
const originalFetch = globalThis.fetch
const submissions = []
globalThis.fetch = async (url, options) => {
  submissions.push({ url, options })
  return { ok: true, json: async () => ({ ok: true }) }
}
try {
  const form = new FormData()
  form.set('name', 'Local verification')
  form.set('email', 'verification@example.invalid')
  form.set('message', 'This is a local test and is never transmitted.')
  form.set('website', '')
  const image = new Blob(['local-test-only'], { type: 'image/webp' })
  await sendEnquiry(form, [{ blob: image }])
  assert.equal(submissions.length, 1)
  assert.equal(submissions[0].url, ENQUIRY_ENDPOINT)
  assert.equal(submissions[0].options.headers['Content-Type'], undefined, 'Browser must set the multipart boundary')
  assert.equal(form.get('attachment').type, 'image/webp')
  assert.equal(form.get('attachment').name, 'idea-1.webp')
  assert.equal(form.has('website'), false)
  await assert.rejects(sendEnquiry(new FormData(), [{ status: 'working' }]), /finish preparing/)
  const bot = new FormData()
  bot.set('website', 'spam')
  await assert.rejects(sendEnquiry(bot), /leave the website field empty/)
  assert.equal(submissions.length, 1, 'Invalid forms must never be sent')

  globalThis.fetch = async () => ({ ok: false, json: async () => ({ errors: [{ message: 'File uploads are not enabled for this form.' }] }) })
  await assert.rejects(sendEnquiry(new FormData(), [{ blob: image }]), /File uploads are not enabled/)
  globalThis.fetch = async () => ({ ok: true, json: async () => { throw new Error('HTML response') } })
  await assert.rejects(sendEnquiry(new FormData()), /could not be sent/)
  globalThis.fetch = async () => { throw new Error('Network unavailable') }
  await assert.rejects(sendEnquiry(new FormData()), /Network unavailable/)
} finally {
  globalThis.fetch = originalFetch
}

const names = new Set(['sculpture', ...collections.map(c => c.cover), ...materials.flatMap(m => [m.image, m.texture])])
for (const name of names) {
  for (const size of [480, 800, 1440]) await fs.access(new URL(`../public/images/bulk/${name}-${size}.webp`, import.meta.url))
}
for (const file of ['original/Lamptwo-480.webp','original/Lamptwo-960.webp','original/LamptwoHover-480.webp','original/LamptwoHover-960.webp','finishes/hammered-brass-1200.webp','finishes/hammered-brass-1800.webp']) {
  await fs.access(new URL(`../public/images/bulk/${file}`, import.meta.url))
}
console.log('Enquiry success/error/attachment contracts and every required image variant passed. No network requests were made.')
