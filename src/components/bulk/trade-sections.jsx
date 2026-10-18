import { useState } from 'react'
import { ArrowUpRight, MessageCircle, BookOpen, Plus } from 'lucide-react'
import { Link } from './navigation'
import { Field, Success } from './ui'
import { Words } from './motion-text'
import { collections } from './content'
import { sendEnquiry } from './enquiries'
const brand = {
  tradeEmail: 'saud@aurelio.in',
  telephone: 'tel:+917817976738',
  phone: '+91 78179 76738',
}
const whatsappBrief =
  'https://wa.me/917817976738?text=' +
  encodeURIComponent(
    "Hello Aurelio \u2014 I'd like to discuss a bulk / trade enquiry.",
  )
const tradeAnswers = [
  [
    'Is there a minimum order quantity?',
    "It depends on the piece and finish: share a rough quantity and we'll advise. For a single piece, visit the online shop.",
  ],
  [
    'What are your lead times?',
    'They depend on the piece. An estimate comes with your quotation.',
  ],
  [
    'Can I customize a piece?',
    'Many pieces can change in size, finish and material. Send us a brief, or drop a photo or sketch of your idea in Your form, your finish.',
  ],
  [
    'Do you ship internationally?',
    'Yes. We export worldwide from Moradabad. Send an export enquiry and we will quote the piece, packing, freight and duties.',
  ],
]
export { TradeAudience } from './TradeAudience'

export function TradeQuestions() {
  return (
    <section className="section container trade-faq">
      <div className="section-heading">
        <div>
          <h2 data-reveal="words">
            <Words>
              Common
              <br /> <em>questions.</em>
            </Words>
          </h2>
        </div>
        <Link className="text-link" to="/faq">
          All questions
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="trade-faq-list">
        {tradeAnswers.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <Plus size={16} />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
export function TradeEnquiry() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')
  const params = new URLSearchParams(window.location.search)
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = new FormData(event.currentTarget)
      data.set('_subject', 'Aurelio \u2014 trade enquiry')
      await sendEnquiry(data)
      setReference('Enquiry sent')
    } catch (error2) {
      setError(error2.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section
      className="enquiry-feature container"
      id="enquire"
      aria-labelledby="enquiry-title"
    >
      <div className="enquiry-card">
        <div className="form-aside">
          <span className="enquiry-kicker">
            LET’S MAKE SOMETHING EXCEPTIONAL
          </span>
          <h2 id="enquiry-title" data-reveal="words">
            <Words>
              Tell us
              <br /> your <em>idea.</em>
            </Words>
          </h2>
          <p>Quantities, finishes, timing. An early idea is fine.</p>
          <p className="brand-contact">
            <a href={`mailto:${brand.tradeEmail}`}>{brand.tradeEmail}</a>
            <a href={brand.telephone}>{brand.phone}</a>
          </p>
          <div className="trade-shortcuts">
            <a
              className="trade-shortcut"
              href={whatsappBrief}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              <span>
                Prefer to talk?
                <small>WhatsApp the trade desk</small>
              </span>
              <ArrowUpRight size={16} />
            </a>
            <Link
              className="trade-shortcut"
              to="/contact?topic=Catalogue%20request"
            >
              <BookOpen size={18} />
              <span>
                Request the catalogue
                <small>Collections and finishes</small>
              </span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <p className="muted">
            Minimums, samples and lead times are confirmed per order. An enquiry
            is not a purchase.
          </p>
        </div>
        <div className="enquiry-form-panel">
          {reference ? (
            <Success title="Thank you.">
              <p>Your enquiry is with the atelier.</p>
              <p>We aim to reply within two working days.</p>
            </Success>
          ) : (
            <form className="editorial-form" onSubmit={submit}>
              <div className="enquiry-form-heading">
                <span className="enquiry-kicker">
                  YOUR NEXT PROJECT STARTS HERE
                </span>
                <h3>Share your brief.</h3>
                <p>A few details are all we need to begin the conversation.</p>
              </div>
              <div className="form-grid">
                <Field label="Your name" name="name" autoComplete="name" />
                <Field
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                />
                <Field
                  label="Company or studio"
                  name="company"
                  required={false}
                  autoComplete="organization"
                />
                <Field
                  label="Country"
                  name="country"
                  autoComplete="country-name"
                />
                <label className="field">
                  <span>Approximate quantity</span>
                  <input
                    name="quantity"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    required
                  />
                </label>
                <label className="field">
                  <span>
                    Object or collection <small>(optional)</small>
                  </span>
                  <input
                    name="product"
                    key={params.get('product') || ''}
                    list="brief-collections"
                    defaultValue={params.get('product') || ''}
                  />
                  <datalist id="brief-collections">
                    {collections.map((c) => (
                      <option key={c.slug} value={c.name} />
                    ))}
                  </datalist>
                </label>
              </div>
              <label className="field">
                <span>Your project</span>
                <textarea
                  name="message"
                  key={params.get('brief') || ''}
                  defaultValue={(params.get('brief') || '').slice(0, 4e3)}
                  minLength={10}
                  maxLength={4e3}
                  required
                  rows={5}
                  placeholder="Materials, size, finish, timeline."
                />
              </label>
              <input
                className="honey-field"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <label className="checkbox-label">
                <input type="checkbox" required />I agree to be contacted about
                this enquiry.
              </label>
              <p className="form-error" role="alert">
                {error}
              </p>
              <button className="button" disabled={busy}>
                {busy ? 'Sending\u2026' : 'Send enquiry'}
                <ArrowUpRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
