import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostmanIntegration from "@/components/PostmanIntegration";
import ProceduralChallengeGenerator from "@/components/ProceduralChallengeGenerator";

export default function Collections() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Postman Collections & Tools</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Export your progress to Postman, generate custom challenges, and access curated API collections for hands-on practice
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <PostmanIntegration />
            <ProceduralChallengeGenerator />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}