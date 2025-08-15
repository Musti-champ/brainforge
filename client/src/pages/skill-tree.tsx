import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressiveSkillTree from "@/components/ProgressiveSkillTree";
import AdaptiveChallengeEngine from "@/components/AdaptiveChallengeEngine";

export default function SkillTree() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Journey</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track your progress through structured skill paths and unlock new challenges as you master API development concepts
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <ProgressiveSkillTree />
            </div>
            <div>
              <AdaptiveChallengeEngine />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}