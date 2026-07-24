import Navbar from "./component/Navbar"
import Hero from "./component/hero"
import Stat from "./component/stat"
import Features from "./component/Features"
import Download from "./component/Download"
import Footer from "./component/footer"
import Screenshots from "./component/Screenshots"
import HowItWorks from "./component/Howitworks"
import About from "./component/About"
import WhyUmrahConnect from "./component/WhyUmrahConnect"
import AvailableWorldwide from "./component/AvailableWorldwide"


export default function Home() {
  return (
    <main>
      <Navbar/>
      <Hero/>
      <Stat/>
      <Features/>
      <Screenshots/>
      <WhyUmrahConnect/>
      <AvailableWorldwide/>
      <HowItWorks/>
      <About/>
      <Download/>
      <Footer/>
    </main>
  )
}
