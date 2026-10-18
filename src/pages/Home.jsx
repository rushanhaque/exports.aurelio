import Seo from '../components/layout/Seo'
import Hero from '../components/sections/Hero'
import Categories from '../components/sections/Categories'
import Manifesto from '../components/sections/Manifesto'
import Atelier from '../components/sections/Atelier'
import Gallery from '../components/sections/Gallery'
import Timeline from '../components/sections/Timeline'
import Heritage from '../components/sections/Heritage'
import Marquee from '../components/sections/Marquee'
import Journal from '../components/sections/Journal'
import ImportedBand from '../components/bulk/ImportedBand'
import { OpeningNote, CommissionScene } from '../components/bulk/home-sections'
import { Studies, LightStudy, ObjectAnatomy, ThreeLives, MakersLens, YourLine } from '../components/bulk/atelier-experiments'
import { MaterialAtelier } from '../components/bulk/material-atelier'
import { TradeAudience, TradeEnquiry, TradeQuestions } from '../components/bulk/trade-sections'
import './Home.css'

export default function Home() {
  return (
    <div className="home-page">
      <Seo
        description="Aurelio by AF International — a metal & wood atelier in Moradabad, India. Handcrafted furniture, lighting, urns and objets in brass, copper and timber since 2008."
        path="/"
      />
      <Hero />
      <ImportedBand><OpeningNote /></ImportedBand>
      <Categories />
      <Gallery />
      <ImportedBand tone="green"><Studies><LightStudy /></Studies></ImportedBand>
      <ImportedBand><Studies><ObjectAnatomy /></Studies></ImportedBand>
      <ImportedBand tone="green"><Studies><ThreeLives /></Studies></ImportedBand>
      <Atelier />
      <ImportedBand tone="green"><MaterialAtelier /></ImportedBand>
      <Heritage tone="white" />
      <Manifesto />
      <ImportedBand><Studies><MakersLens /></Studies></ImportedBand>
      <ImportedBand tone="green"><Studies><YourLine /></Studies></ImportedBand>
      <Timeline />
      <ImportedBand tone="green"><TradeAudience /></ImportedBand>
      <ImportedBand><TradeEnquiry /></ImportedBand>
      <ImportedBand tone="green"><TradeQuestions /></ImportedBand>
      <Marquee />
      <Journal />
      <ImportedBand><CommissionScene /></ImportedBand>
    </div>
  )
}
