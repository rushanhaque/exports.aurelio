import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ArrowUpRight, ImagePlus, X } from 'lucide-react'
import { sendEnquiry } from './enquiries'
const MAX_PICTURES = 3
const MAX_SOURCE = 25 * 1024 * 1024
const SIDE = 1600
const OK_TYPE = /^image\/(jpeg|png|webp)$/
const METALS = [
  'Brass',
  'Copper',
  'Bronze',
  'Patinated steel',
  'Wood',
  'Not sure yet',
]
async function prepare(file) {
  if (file.size > MAX_SOURCE)
    throw new Error(
      'That picture is very large. Please choose one under 25 MB.',
    )
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    })
    const scale = Math.min(1, SIDE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size <= 15e5 && OK_TYPE.test(file.type)) {
      bitmap.close()
      return file
    }
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.88),
    )
    if (blob) return blob
  } catch {}
  if (OK_TYPE.test(file.type) && file.size <= 6 * 1024 * 1024) return file
  throw new Error(
    'That format is not supported. Please use a JPG, PNG or WebP.',
  )
}
export function BriefStudio() {
  const uid = useId()
  const [pictures, setPictures] = useState([])
  const [over, setOver] = useState(false)
  const [notice, setNotice] = useState('')
  const [metal, setMetal] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(null)
  const urls = useRef([])
  const thanks = useRef(null)
  useEffect(
    () => () => urls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  )
  useEffect(() => {
    if (!sent) return
    const node = thanks.current
    node?.focus({ preventScroll: true })
    node?.scrollIntoView({
      block: 'center',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }, [sent])
  const patch = useCallback(
    (picture, change) =>
      setPictures((all) =>
        all.map((item) =>
          item.key === picture ? { ...item, ...change } : item,
        ),
      ),
    [],
  )
  const add = useCallback(
    (list) => {
      const files = [...(list || [])].filter((file) =>
        file.type.startsWith('image/'),
      )
      if (!files.length) {
        setNotice('Please choose a picture: a photo, a drawing or a sketch.')
        return
      }
      const room = MAX_PICTURES - pictures.length
      if (room <= 0) {
        setNotice(`Up to ${MAX_PICTURES} pictures. Remove one to add another.`)
        return
      }
      const chosen = files.slice(0, room)
      setNotice(
        files.length > room
          ? `Added ${chosen.length}. The limit is ${MAX_PICTURES} pictures.`
          : `${chosen.length} ${chosen.length === 1 ? 'picture' : 'pictures'} added.`,
      )
      setError('')
      for (const file of chosen) {
        const picture = globalThis.crypto.randomUUID()
        const url = URL.createObjectURL(file)
        urls.current.push(url)
        setPictures((all) => [
          ...all,
          {
            key: picture,
            name: file.name || 'Pasted picture',
            url,
            status: 'working',
          },
        ])
        prepare(file)
          .then((blob) => patch(picture, { status: 'ready', blob }))
          .catch((failure) =>
            patch(picture, { status: 'error', error: failure.message }),
          )
      }
    },
    [pictures.length, patch],
  )
  const remove = (picture) => {
    URL.revokeObjectURL(picture.url)
    setPictures((all) => all.filter((item) => item.key !== picture.key))
    setNotice(`${picture.name} removed.`)
  }
  const onDrop = (event) => {
    event.preventDefault()
    setOver(false)
    add(event.dataTransfer.files)
  }
  const onPaste = (event) => {
    if (event.clipboardData.files.length) {
      event.preventDefault()
      add(event.clipboardData.files)
    }
  }
  const dragging = {
    onDragEnter: (event) => {
      event.preventDefault()
      setOver(true)
    },
    onDragOver: (event) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    },
    onDragLeave: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOver(false)
    },
    onDrop,
  }
  const working = pictures.some((item) => item.status === 'working')
  async function submit(event) {
    event.preventDefault()
    if (working) return
    if (pictures.some((item) => item.status === 'error')) {
      setError(
        'One picture could not be prepared. Remove it, or add it again, to continue.',
      )
      return
    }
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      form.set('product', `Bespoke idea${metal ? ` \xB7 ${metal}` : ''}`)
      form.set('preferredMetal', metal)
      form.set('_subject', 'Aurelio \u2014 bespoke idea')
      await sendEnquiry(form, pictures)
      setSent({ name: String(form.get('name') || '') })
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }
  function again() {
    pictures.forEach((item) => URL.revokeObjectURL(item.url))
    setPictures([])
    setMetal('')
    setSent(null)
    setNotice('')
  }
  if (sent)
    return (
      <div
        className="brief brief-thanks"
        role="status"
        tabIndex={-1}
        ref={thanks}
      >
        <p className="brief-kicker">{'ENQUIRY SENT'}</p>
        <h3>
          Thank you{sent.name ? `, ${sent.name.split(' ')[0]}` : ''}.{' '}
          <em>Your idea is with the atelier.</em>
        </h3>
        <p>
          We read every idea and reply by email, usually with a few questions
          and a plan for samples. Nothing is charged for a conversation.
        </p>
        {!!pictures.length && (
          <ul className="brief-sent" aria-label="Pictures you sent">
            {pictures.map((item) => (
              <li key={item.key}>
                <img src={item.url} alt="" />
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="brief-again" onClick={again}>
          Send another idea <ArrowUpRight size={16} />
        </button>
      </div>
    )
  const full = pictures.length >= MAX_PICTURES
  return (
    <div className="brief" onPaste={onPaste}>
      <div className="brief-media">
        {pictures.length ? (
          <ul className="brief-pictures" data-count={pictures.length}>
            {pictures.map((item) => (
              <li key={item.key} className={`brief-picture is-${item.status}`}>
                <img src={item.url} alt={`Your picture: ${item.name}`} />
                {item.status === 'working' && (
                  <span className="brief-state">Preparing…</span>
                )}
                {item.status === 'error' && (
                  <span className="brief-state brief-state--error">
                    {item.error}
                  </span>
                )}
                <button
                  type="button"
                  className="brief-remove"
                  onClick={() => remove(item)}
                  aria-label={`Remove ${item.name}`}
                >
                  <X size={15} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {!full && (
          <label
            className={`brief-drop ${pictures.length ? 'is-compact' : ''} ${over ? 'is-over' : ''}`}
            {...dragging}
          >
            <input
              className="brief-file"
              type="file"
              aria-label="Add photos, drawings or sketches"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => {
                add(event.target.files)
                event.target.value = ''
              }}
              aria-describedby={`${uid}-hint`}
            />
            <span className="brief-tick brief-tick--tl" aria-hidden="true" />
            <span className="brief-tick brief-tick--tr" aria-hidden="true" />
            <span className="brief-tick brief-tick--bl" aria-hidden="true" />
            <span className="brief-tick brief-tick--br" aria-hidden="true" />
            <ImagePlus
              size={pictures.length ? 20 : 34}
              strokeWidth={1.2}
              aria-hidden="true"
            />
            <strong>
              {over
                ? 'Release to add'
                : pictures.length
                  ? 'Add another picture'
                  : 'Drop your idea here'}
            </strong>
            {!pictures.length && (
              <span className="brief-sub">
                A photograph, a drawing or a pencil sketch.
              </span>
            )}
            <span className="brief-hint" id={`${uid}-hint`}>
              {pictures.length
                ? 'Drop, browse or paste'
                : 'Drop, browse, paste or take a photo'}{' '}
              · JPG, PNG or WebP · up to {MAX_PICTURES}
            </span>
          </label>
        )}
        <p className="sr-only" role="status" aria-live="polite">
          {notice}
        </p>
        {notice && !pictures.length && <p className="brief-notice">{notice}</p>}
      </div>
      <form className="brief-form" onSubmit={submit}>
        <label className="brief-field">
          <span>What do you have in mind?</span>
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={3800}
            rows={4}
            placeholder="A vessel like this, in brass, about forty centimetres tall. Or: a lamp base from this sketch, with a darker finish…"
          />
        </label>
        <fieldset className="brief-metals">
          <legend>Preferred metal</legend>
          <div className="experiment-options">
            {METALS.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={metal === name}
                onClick={() => setMetal(metal === name ? '' : name)}
              >
                {name}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="brief-row">
          <label className="brief-field">
            <span>Your name</span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
            />
          </label>
          <label className="brief-field">
            <span>Email address</span>
            <input
              name="email"
              type="email"
              required
              maxLength={200}
              autoComplete="email"
            />
          </label>
        </div>
        <div className="brief-row">
          <label className="brief-field">
            <span>Country</span>
            <input
              name="country"
              required
              minLength={2}
              maxLength={80}
              autoComplete="country-name"
            />
          </label>
          <label className="brief-field">
            <span>
              How many pieces? <small>(roughly)</small>
            </span>
            <input
              name="quantity"
              type="number"
              min={1}
              max={1e5}
              defaultValue={1}
              inputMode="numeric"
            />
          </label>
        </div>
        <label className="brief-field">
          <span>
            Company or studio <small>(optional)</small>
          </span>
          <input name="company" maxLength={200} autoComplete="organization" />
        </label>
        <input
          className="brief-trap"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <button className="brief-submit" disabled={busy || working}>
          <span>
            {busy
              ? 'Sending\u2026'
              : working
                ? 'Preparing your pictures\u2026'
                : 'Start the conversation'}
          </span>
          <ArrowUpRight size={18} />
        </button>
        <p className="brief-note">
          Your pictures stay private to the Aurelio studio. We use them only to
          reply to you.
        </p>
        <p className="brief-error" role="alert">
          {error}
        </p>
      </form>
    </div>
  )
}
