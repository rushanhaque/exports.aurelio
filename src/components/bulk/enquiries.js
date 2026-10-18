// Reuse the service already configured by ContactPage. Keep files local until
// the visitor submits, then send them in the same request as the written brief.
export const ENQUIRY_ENDPOINT = 'https://formspree.io/f/xojzgalw'

export async function sendEnquiry(data, pictures = []) {
  if (String(data.get('website') || '').trim()) throw new Error('Please leave the website field empty.')
  data.delete('website')
  if (pictures.length > 3) throw new Error('Please attach up to three pictures.')
  for (const [index, picture] of pictures.entries()) {
    if (!(picture.blob instanceof Blob)) throw new Error('Please wait for your pictures to finish preparing.')
    const extension = { 'image/png': 'png', 'image/webp': 'webp', 'image/jpeg': 'jpg' }[picture.blob.type]
    if (!extension) throw new Error('Please use JPG, PNG or WebP pictures.')
    data.append('attachment', picture.blob, `idea-${index + 1}.${extension}`)
  }
  const response = await fetch(ENQUIRY_ENDPOINT, {
    method: 'POST', headers: { Accept: 'application/json' }, body: data,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result || result.errors?.length || result.error) {
    const detail = result?.errors?.map(error => error.message).filter(Boolean).join(' ') || result?.error
    throw new Error(detail || (pictures.length
      ? 'Your enquiry could not be sent with these pictures. Please try again or email the studio at saud@aurelio.in.'
      : 'Your enquiry could not be sent. Please try again or email saud@aurelio.in.'))
  }
  return result
}
