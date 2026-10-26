import Navbar from "./component/Navbar"
import Hero from "./component/hero"
import Stat from "./component/stat"
import JourneyStory from "./component/JourneyStory"
import Features from "./component/Features"
import Download from "./component/Download"
import Footer from "./component/footer"
import Screenshots from "./component/Screenshots"
import HowItWorks from "./component/Howitworks"
import About from "./component/About"
import WhyUmrahConnect from "./component/WhyUmrahConnect"
import AvailableWorldwide from "./component/AvailableWorldwide"
import PremiumBand from "./component/PremiumBand"
import AgentsBand from "./component/AgentsBand"

// Home page: the story flows from top to bottom. Hero → numbers → a pilgrim's journey stage by
// stage → features → the app in action → Premium → why us → for agencies → languages →
// how to start → about → download.
export default function Home() {
  return (
    <main>
      <Navbar/>
      <Hero/>
      <Stat/>
      <JourneyStory/>
      <Features/>
      <Screenshots/>
      <PremiumBand/>
      <WhyUmrahConnect/>
      <AgentsBand/>
      <AvailableWorldwide/>
      <HowItWorks/>
      <About/>
      <Download/>
      <Footer/>
    </main>
  )
}
