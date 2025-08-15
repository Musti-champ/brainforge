import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ActiveChallenge from "@/components/ActiveChallenge";
import ChallengeLibrary from "@/components/ChallengeLibrary";
import Footer from "@/components/Footer";

export default function Game() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <ActiveChallenge />
      <ChallengeLibrary />
      <Footer />
    </div>
  );
}
