import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeaderboardSystem from "@/components/LeaderboardSystem";

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeaderboardSystem />
        </div>
      </section>

      <Footer />
    </div>
  );
}