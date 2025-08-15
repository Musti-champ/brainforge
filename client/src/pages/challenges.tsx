import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Clock, Users, Star, ExternalLink, ArrowLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

export default function Challenges() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["/api/challenges", selectedDifficulty, selectedCategory],
  });

  const filteredChallenges = challenges
    .filter(challenge => {
      const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "difficulty":
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case "xp":
          return b.xpReward - a.xpReward;
        case "time":
          return a.estimatedTime - b.estimatedTime;
        default: // popularity
          return (b.completedCount || 0) - (a.completedCount || 0);
      }
    });

  const difficultyOptions = [
    { label: "All Difficulties", value: "" },
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
  ];

  const categoryOptions = [
    { label: "All Categories", value: "" },
    { label: "REST APIs", value: "REST" },
    { label: "Authentication", value: "Authentication" },
    { label: "GraphQL", value: "GraphQL" },
  ];

  const sortOptions = [
    { label: "Most Popular", value: "popularity" },
    { label: "Difficulty", value: "difficulty" },
    { label: "XP Reward", value: "xp" },
    { label: "Time Required", value: "time" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <Button variant="ghost" className="mb-4" data-testid="back-to-game">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Game
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">All Challenges</h1>
              <p className="text-lg text-gray-600">
                Explore our complete collection of API learning challenges
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{challenges.length}</div>
                <div className="text-sm text-gray-500">Total Challenges</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Challenges
              </label>
              <Input
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-challenges"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger data-testid="difficulty-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger data-testid="sort-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedDifficulty || selectedCategory || searchQuery) && (
            <div className="mt-4 flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Active filters:</span>
              {selectedDifficulty && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Difficulty: {selectedDifficulty}</span>
                  <button
                    onClick={() => setSelectedDifficulty("")}
                    className="ml-1 hover:bg-gray-200 rounded-full"
                    data-testid="clear-difficulty-filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Category: {selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="ml-1 hover:bg-gray-200 rounded-full"
                    data-testid="clear-category-filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Search: "{searchQuery}"</span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:bg-gray-200 rounded-full"
                    data-testid="clear-search-filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDifficulty("");
                  setSelectedCategory("");
                  setSearchQuery("");
                }}
                data-testid="clear-all-filters"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Challenge Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Filter className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms to find more challenges.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDifficulty("");
                  setSelectedCategory("");
                  setSearchQuery("");
                }}
                data-testid="reset-filters"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredChallenges.length} Challenge{filteredChallenges.length !== 1 ? 's' : ''} Found
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge) => (
                  <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}
                            data-testid={`challenge-difficulty-${challenge.id}`}
                          >
                            {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={categoryColors[challenge.category as keyof typeof categoryColors]}
                          >
                            {challenge.category}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-accent" />
                          <span className="text-sm font-medium text-gray-600">
                            {challenge.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <CardTitle className="text-lg mb-2" data-testid={`challenge-title-${challenge.id}`}>
                        {challenge.title}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {challenge.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {challenge.estimatedTime} min
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {challenge.completedCount?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>

                      {/* Challenge Requirements Preview */}
                      {challenge.requirements && challenge.requirements.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">What you'll learn:</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {challenge.requirements.slice(0, 3).map((req, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {req}
                              </li>
                            ))}
                            {challenge.requirements.length > 3 && (
                              <li className="text-xs text-gray-500">
                                +{challenge.requirements.length - 3} more...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <Link href="/" className="flex-1">
                          <Button 
                            className="w-full" 
                            data-testid={`start-challenge-${challenge.id}`}
                          >
                            Start Challenge
                          </Button>
                        </Link>
                        {challenge.postmanCollectionUrl && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => window.open(challenge.postmanCollectionUrl, '_blank')}
                            data-testid={`postman-link-${challenge.id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
