import { useState } from "react";
import { Shuffle, Settings, Sparkles, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface GeneratedChallenge {
  title: string;
  description: string;
  difficulty: string;
  category: string;
  apiEndpoint: string;
  objectives: string[];
  hints: string[];
}

export default function ProceduralChallengeGenerator() {
  const [difficulty, setDifficulty] = useState(["2"]);
  const [category, setCategory] = useState("REST");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedChallenge, setGeneratedChallenge] = useState<GeneratedChallenge | null>(null);

  const apiTemplates = {
    REST: [
      { name: "JSONPlaceholder", url: "https://jsonplaceholder.typicode.com", type: "Mock Data" },
      { name: "Chuck Norris Jokes", url: "https://api.chucknorris.io", type: "Entertainment" },
      { name: "Cat Facts", url: "https://catfact.ninja", type: "Fun Facts" },
      { name: "Numbers API", url: "http://numbersapi.com", type: "Educational" }
    ],
    GraphQL: [
      { name: "Rick & Morty", url: "https://rickandmortyapi.com/graphql", type: "Entertainment" },
      { name: "Countries", url: "https://countries.trevorblades.com", type: "Geography" }
    ],
    Authentication: [
      { name: "GitHub API", url: "https://api.github.com", type: "OAuth" },
      { name: "Spotify API", url: "https://api.spotify.com", type: "OAuth 2.0" }
    ]
  };

  const challengeTemplates = {
    beginner: [
      "Make a simple GET request and display the response",
      "Parse JSON data and extract specific fields",
      "Handle basic error responses"
    ],
    intermediate: [
      "Implement pagination for large datasets",
      "Create a data transformation pipeline",
      "Build error handling with retry logic"
    ],
    advanced: [
      "Implement OAuth authentication flow",
      "Build a real-time data sync system",
      "Create a rate-limited API client"
    ]
  };

  const getDifficultyLabel = (value: string) => {
    switch (value) {
      case "1": return "beginner";
      case "2": return "intermediate";
      case "3": return "advanced";
      default: return "intermediate";
    }
  };

  const generateChallenge = async () => {
    setIsGenerating(true);
    
    // Simulate challenge generation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const difficultyLevel = getDifficultyLabel(difficulty[0]);
    const apis = apiTemplates[category as keyof typeof apiTemplates] || apiTemplates.REST;
    const selectedApi = apis[Math.floor(Math.random() * apis.length)];
    const templates = challengeTemplates[difficultyLevel as keyof typeof challengeTemplates];
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    const challenge: GeneratedChallenge = {
      title: `${selectedApi.name} ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} Challenge`,
      description: `${selectedTemplate} using the ${selectedApi.name} API. This challenge will test your understanding of ${category} concepts while working with real-world data.`,
      difficulty: difficultyLevel,
      category,
      apiEndpoint: selectedApi.url,
      objectives: [
        `Connect to the ${selectedApi.name} API`,
        "Handle the API response correctly",
        "Implement proper error handling",
        "Display results in a user-friendly format"
      ],
      hints: [
        "Check the API documentation for required parameters",
        "Use proper HTTP methods for different operations",
        "Test your requests in a tool like Postman first"
      ]
    };
    
    setGeneratedChallenge(challenge);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Procedural Challenge Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenge Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REST">REST APIs</SelectItem>
                    <SelectItem value="GraphQL">GraphQL</SelectItem>
                    <SelectItem value="Authentication">Authentication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level: {getDifficultyLabel(difficulty[0])}
                </label>
                <Slider
                  value={difficulty}
                  onValueChange={setDifficulty}
                  max={3}
                  min={1}
                  step={1}
                  className="w-full"
                  data-testid="difficulty-slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Advanced</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Available APIs for {category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(apiTemplates[category as keyof typeof apiTemplates] || []).map((api, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{api.name}</div>
                        <div className="text-xs text-gray-500">{api.type}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={generateChallenge}
              disabled={isGenerating}
              className="w-full"
              data-testid="generate-challenge"
            >
              {isGenerating ? (
                <>
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                  Generating Challenge...
                </>
              ) : (
                <>
                  <Shuffle className="h-4 w-4 mr-2" />
                  Generate New Challenge
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedChallenge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-secondary" />
                <span>Generated Challenge</span>
              </span>
              <Badge className={
                generatedChallenge.difficulty === "beginner" ? "bg-green-100 text-green-800" :
                generatedChallenge.difficulty === "intermediate" ? "bg-amber-100 text-amber-800" :
                "bg-red-100 text-red-800"
              }>
                {generatedChallenge.difficulty.charAt(0).toUpperCase() + generatedChallenge.difficulty.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {generatedChallenge.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {generatedChallenge.description}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">API Endpoint</h4>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {generatedChallenge.apiEndpoint}
                </code>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Objectives</h4>
                <ul className="space-y-1">
                  {generatedChallenge.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button data-testid="start-generated-challenge">
                  Start This Challenge
                </Button>
                <Button variant="outline" data-testid="save-challenge">
                  Save for Later
                </Button>
                <Button variant="ghost" onClick={generateChallenge} data-testid="generate-another">
                  Generate Another
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}