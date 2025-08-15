import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Users, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-amber-100 text-amber-800", 
  advanced: "bg-red-100 text-red-800",
};

const categoryColors = {
  REST: "bg-blue-100 text-blue-800",
  GraphQL: "bg-purple-100 text-purple-800",
  Authentication: "bg-orange-100 text-orange-800",
};

export default function ChallengeLibrary() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: challenges = [] } = useQuery({
    queryKey: ["/api/challenges", selectedDifficulty, selectedCategory],
  });

  const filters = [
    { label: "All Levels", value: "", active: !selectedDifficulty },
    { label: "Beginner", value: "beginner", active: selectedDifficulty === "beginner" },
    { label: "Intermediate", value: "intermediate", active: selectedDifficulty === "intermediate" },
    { label: "Advanced", value: "advanced", active: selectedDifficulty === "advanced" },
  ];

  const categoryFilters = [
    { label: "REST APIs", value: "REST", active: selectedCategory === "REST" },
    { label: "Authentication", value: "Authentication", active: selectedCategory === "Authentication" },
    { label: "GraphQL", value: "GraphQL", active: selectedCategory === "GraphQL" },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Challenges</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master APIs through hands-on puzzles designed to progressively build your skills
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={filter.active ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(filter.value)}
              data-testid={`filter-${filter.value || 'all'}`}
            >
              {filter.label}
            </Button>
          ))}
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          {categoryFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={filter.active ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(filter.value)}
              data-testid={`category-filter-${filter.value.toLowerCase()}`}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge 
                    className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}
                    data-testid={`challenge-difficulty-${challenge.id}`}
                  >
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="text-sm text-gray-600" data-testid={`challenge-xp-${challenge.id}`}>
                      {challenge.xpReward} XP
                    </span>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 mb-2" data-testid={`challenge-title-${challenge.id}`}>
                  {challenge.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4" data-testid={`challenge-description-${challenge.id}`}>
                  {challenge.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span>
                      <Clock className="h-4 w-4 inline mr-1" />
                      {challenge.estimatedTime} min
                    </span>
                    <span>
                      <Users className="h-4 w-4 inline mr-1" />
                      {challenge.completedCount?.toLocaleString()} completed
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    className="flex-1" 
                    data-testid={`start-challenge-${challenge.id}`}
                  >
                    Start Challenge
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    data-testid={`postman-link-${challenge.id}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            data-testid="load-more-challenges"
          >
            Load More Challenges
          </Button>
        </div>
      </div>
    </section>
  );
}
