import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ScrollMarquee from "@/components/ScrollMarquee";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Capabilities from "@/components/Capabilities";
import Team from "@/components/Team";
import TimeCalculator from "@/components/TimeCalculator";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ScrollMarquee words={["Let the AI handle it", "From chaos to control"]} tilt={-1.5} />
        <Stats />
        <Services />
        <Process />
        <Capabilities />
        <Team />
        <ScrollMarquee words={["Smart automation", "Built for modern businesses"]} reverse outline />
        <TimeCalculator />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
