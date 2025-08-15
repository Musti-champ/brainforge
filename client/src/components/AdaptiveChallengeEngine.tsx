import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brain, TrendingUp, Target, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdaptiveMetrics {
  skillLevel: number;
  completionRate: number;
  averageTime: number;
  preferredDifficulty: string;
  strongAreas: string[];
  improvementAreas: string[];
}

export default function AdaptiveChallengeEngine() {
  const [metrics, setMetrics] = useState<AdaptiveMetrics>({
    skillLevel: 65,
    completionRate: 78,
    averageTime: 25,
    preferredDifficulty: "intermediate",
    strongAreas: ["REST APIs", "JSON Parsing"],
    improvementAreas: ["Authentication", "Error Handling"]
  });

  const [recommendedChallenges, setRecommendedChallenges] = useState([]);

  const { data: user } = useQuery({
    queryKey: ["/api/users/user-1"],
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/users/user-1/progress"],
  });

  // Simulate adaptive algorithm based on user performance
  useEffect(() => {
    if (userProgress && userProgress.length > 0) {
      const completed = userProgress.filter(p => p.isCompleted).length;
      const total = userProgress.length;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      
      setMetrics(prev => ({
        ...prev,
        completionRate: Math.round(rate)
      }));
    }
  }, [userProgress]);

  const getNextRecommendation = () => {
    // Simple adaptive logic - in a real system this would be more sophisticated
    if (metrics.completionRate > 80) {
      return "Ready for advanced challenges!";
    } else if (metrics.completionRate > 60) {
      return "Continue with intermediate level";
    } else {
      return "Focus on fundamentals first";
    }
  };

  const getSkillColor = (level: number) => {
    if (level >= 80) return "text-green-600";
    if (level >= 60) return "text-blue-600";
    if (level >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI-Powered Learning Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getSkillColor(metrics.skillLevel)} mb-2`}>
                {metrics.skillLevel}%
              </div>
              <div className="text-sm text-gray-600">Overall Skill Level</div>
              <Progress value={metrics.skillLevel} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {metrics.completionRate}%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
              <Progress value={metrics.completionRate} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {metrics.averageTime}m
              </div>
              <div className="text-sm text-gray-600">Avg. Time per Challenge</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">Improving</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-secondary" />
              <span>Strength Areas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.strongAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{area}</span>
                  <Badge variant="secondary" className="text-xs">
                    Mastered
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-accent" />
              <span>Focus Areas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{area}</span>
                  <Badge variant="outline" className="text-xs">
                    Practice More
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium text-primary mb-1">AI Recommendation</h4>
                <p className="text-sm text-gray-700 mb-3">
                  {getNextRecommendation()}
                </p>
                <Button size="sm" data-testid="apply-recommendation">
                  Apply Recommendation
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}