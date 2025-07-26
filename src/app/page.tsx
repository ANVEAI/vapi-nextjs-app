import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { DemoSection } from "@/components/DemoSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { VoiceBot } from "@/components/VoiceBot";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <CTASection />
      <Footer />
      <VoiceBot />
    </div>
  );
}
