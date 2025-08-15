import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Brain, CheckCircle, AlertTriangle, Info, Lightbulb, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CodeReviewResult {
  overallScore: number;
  codeQuality: {
    score: number;
    issues: Array<{
      type: "error" | "warning" | "suggestion";
      line: number;
      message: string;
      suggestion: string;
    }>;
  };
  bestPractices: {
    score: number;
    feedback: string[];
    improvements: string[];
  };
  performance: {
    score: number;
    optimizations: string[];
    complexity: string;
  };
  security: {
    score: number;
    vulnerabilities: string[];
    recommendations: string[];
  };
  learningPoints: {
    strengths: string[];
    areasToImprove: string[];
    nextSteps: string[];
  };
  personalizedTips: string[];
}

export default function AICodeReview({ 
  code, 
  challengeId, 
  userSkillLevel 
}: { 
  code: string; 
  challengeId: string; 
  userSkillLevel: number;
}) {
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);

  const reviewCodeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/ai/code-review", {
        code,
        challengeId,
        userSkillLevel
      });
    },
    onSuccess: (data) => {
      setReviewResult(data);
    },
  });

  // Mock AI review result for demonstration
  const getMockReviewResult = (): CodeReviewResult => {
    return {
      overallScore: 78,
      codeQuality: {
        score: 85,
        issues: [
          {
            type: "warning",
            line: 5,
            message: "Consider using const instead of let for immutable variables",
            suggestion: "const response = await fetch(url);"
          },
          {
            type: "suggestion", 
            line: 12,
            message: "Add error handling for the JSON parsing",
            suggestion: "try { const data = await response.json(); } catch (error) { /* handle error */ }"
          }
        ]
      },
      bestPractices: {
        score: 72,
        feedback: [
          "Good use of async/await syntax",
          "Proper variable naming conventions",
          "Missing error handling in critical sections"
        ],
        improvements: [
          "Add comprehensive error handling",
          "Consider adding input validation",
          "Include logging for debugging purposes"
        ]
      },
      performance: {
        score: 80,
        optimizations: [
          "Consider caching API responses for repeated calls",
          "Use request timeout to prevent hanging requests"
        ],
        complexity: "Low - code is well-structured and readable"
      },
      security: {
        score: 75,
        vulnerabilities: [
          "API endpoint URL should be validated",
          "Consider rate limiting for API calls"
        ],
        recommendations: [
          "Validate all external inputs",
          "Use environment variables for sensitive data",
          "Implement proper authentication headers"
        ]
      },
      learningPoints: {
        strengths: [
          "Clean and readable code structure",
          "Proper use of modern JavaScript features",
          "Good understanding of API interaction patterns"
        ],
        areasToImprove: [
          "Error handling and edge cases",
          "Security best practices",
          "Performance optimization techniques"
        ],
        nextSteps: [
          "Learn about try/catch error handling",
          "Study API security principles",
          "Practice with more complex API scenarios"
        ]
      },
      personalizedTips: [
        "Based on your skill level, focus on mastering error handling patterns",
        "Try implementing the suggested improvements in your next challenge",
        "Consider exploring API caching strategies for better performance"
      ]
    };
  };

  const handleReviewCode = () => {
    // For demo purposes, use mock data immediately
    setTimeout(() => {
      setReviewResult(getMockReviewResult());
    }, 1500);
    
    // Uncomment below for real AI integration
    // reviewCodeMutation.mutate();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-blue-100 text-blue-800";
    if (score >= 60) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "suggestion":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!reviewResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Code Review</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Get personalized feedback on your code from our AI reviewer. 
              Improve your skills with detailed analysis and suggestions.
            </p>
            <Button 
              onClick={handleReviewCode}
              disabled={reviewCodeMutation.isPending || !code.trim()}
              className="w-full"
              data-testid="start-review"
            >
              {reviewCodeMutation.isPending ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing Code...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Start AI Review
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(reviewResult.overallScore)} mb-2`}>
              {reviewResult.overallScore}%
            </div>
            <div className="text-gray-600 mb-4">Overall Code Quality Score</div>
            <Progress value={reviewResult.overallScore} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="quality" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Code Quality Analysis</span>
                <Badge className={getScoreBadgeColor(reviewResult.codeQuality.score)}>
                  {reviewResult.codeQuality.score}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={reviewResult.codeQuality.score} />
                
                {reviewResult.codeQuality.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Issues Found</h4>
                    <div className="space-y-3">
                      {reviewResult.codeQuality.issues.map((issue, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start space-x-3">
                            {getIssueIcon(issue.type)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium">Line {issue.line}</span>
                                <Badge variant="outline" className="text-xs">
                                  {issue.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{issue.message}</p>
                              <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                                {issue.suggestion}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-2">✓ Good Practices</h5>
                      <ul className="space-y-1">
                        {reviewResult.bestPractices.feedback.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-amber-700 mb-2">⚡ Improvements</h5>
                      <ul className="space-y-1">
                        {reviewResult.bestPractices.improvements.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <TrendingUp className="h-3 w-3 text-amber-500 mt-1 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Performance Analysis</span>
                <Badge className={getScoreBadgeColor(reviewResult.performance.score)}>
                  {reviewResult.performance.score}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={reviewResult.performance.score} />
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Complexity Assessment</h4>
                  <p className="text-sm text-gray-600">{reviewResult.performance.complexity}</p>
                </div>
                
                {reviewResult.performance.optimizations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Optimization Suggestions</h4>
                    <ul className="space-y-2">
                      {reviewResult.performance.optimizations.map((optimization, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <Star className="h-3 w-3 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                          {optimization}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Security Analysis</span>
                <Badge className={getScoreBadgeColor(reviewResult.security.score)}>
                  {reviewResult.security.score}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={reviewResult.security.score} />
                
                {reviewResult.security.vulnerabilities.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Security Considerations:</strong>
                      <ul className="mt-2 space-y-1">
                        {reviewResult.security.vulnerabilities.map((vuln, index) => (
                          <li key={index} className="text-sm">• {vuln}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Security Recommendations</h4>
                  <ul className="space-y-2">
                    {reviewResult.security.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-accent" />
                <span>Personalized Learning Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-700 mb-3">🎯 Your Strengths</h4>
                    <ul className="space-y-2">
                      {reviewResult.learningPoints.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-amber-700 mb-3">📈 Areas to Improve</h4>
                    <ul className="space-y-2">
                      {reviewResult.learningPoints.areasToImprove.map((area, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-700 mb-3">🚀 Next Steps</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {reviewResult.learningPoints.nextSteps.map((step, index) => (
                        <li key={index} className="text-sm text-blue-800">
                          {index + 1}. {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-purple-700 mb-3">💡 Personalized Tips</h4>
                  <div className="space-y-3">
                    {reviewResult.personalizedTips.map((tip, index) => (
                      <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-purple-800">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button 
          onClick={handleReviewCode}
          variant="outline"
          data-testid="review-again"
        >
          Review Again
        </Button>
        <Button data-testid="save-feedback">
          Save Feedback
        </Button>
      </div>
    </div>
  );
}