import { HeroSection } from "@/components/home/HeroSection";
import { ProtocolStack } from "@/components/home/ProtocolStack";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { InstancesSection } from "@/components/home/InstancesSection";
import { ChatPreview } from "@/components/home/ChatPreview";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProtocolStack />
      <StatsSection />
      <FeaturesSection />
      <InstancesSection />
      <ChatPreview />
      <Footer />
    </>
  );
}
