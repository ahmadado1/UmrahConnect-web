import Navbar from "./component/Navbar"
import Hero from "./component/hero"
import Stat from "./component/stat"
import Features from "./component/Features"
import Download from "./component/Download"
import Footer from "./component/footer"
import Screenshots from "./component/Screenshots"
import HowItWorks from "./component/Howitworks"
import About from "./component/About"


export default function Home() {
  return (
    <main>
      <Navbar/>
      <Hero/>
      <Stat/>
      <Features/>
      <Screenshots/>
      <HowItWorks/>
      <About/>
      <Download/>
      <Footer/>
      
    </main>
  )
}