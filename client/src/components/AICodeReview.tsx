
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Brain, CheckCircle, AlertTriangle, XCircle, Lightbulb, Zap, Code, FileText, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CodeIssue {
  id: string;
  type: "error" | "warning" | "suggestion" | "security";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  line?: number;
  column?: number;
  codeSnippet?: string;
  suggestion?: string;
  category: string;
}

interface CodeReview {
  id: string;
  overallScore: number;
  issues: CodeIssue[];
  strengths: string[];
  recommendations: string[];
  performanceInsights: string[];
  securityAnalysis: {
    score: number;
    vulnerabilities: string[];
    recommendations: string[];
  };
  codeQuality: {
    readability: number;
    maintainability: number;
    efficiency: number;
    testability: number;
  };
  estimatedReviewTime: number;
  language: string;
  complexity: "low" | "medium" | "high";
}

export default function AICodeReview({ challengeId }: { challengeId?: string }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [reviewType, setReviewType] = useState("comprehensive");
  const [review, setReview] = useState<CodeReview | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CodeIssue | null>(null);
  const { toast } = useToast();

  // Mock AI code review
  const performReview = async () => {
    setIsReviewing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate mock review based on code content
    const mockReview: CodeReview = {
      id: `review-${Date.now()}`,
      overallScore: Math.floor(Math.random() * 30) + 70, // 70-100 score
      issues: [
        {
          id: "issue-1",
          type: "warning",
          severity: "medium",
          title: "Missing Error Handling",
          description: "The fetch request doesn't have proper error handling for network failures or invalid responses.",
          line: 5,
          column: 3,
          codeSnippet: "fetch('https://api.example.com/data')",
          suggestion: "Add try-catch blocks and check response.ok before parsing JSON",
          category: "Error Handling"
        },
        {
          id: "issue-2",
          type: "suggestion",
          severity: "low",
          title: "Consider Using Async/Await",
          description: "The promise chain could be simplified using async/await syntax for better readability.",
          line: 3,
          column: 1,
          codeSnippet: ".then(response => response.json()).then(data => {",
          suggestion: "const response = await fetch(url); const data = await response.json();",
          category: "Code Style"
        },
        {
          id: "issue-3",
          type: "security",
          severity: "high",
          title: "Potential XSS Vulnerability",
          description: "Direct DOM manipulation with user input could lead to cross-site scripting attacks.",
          line: 12,
          column: 5,
          codeSnippet: "element.innerHTML = userInput;",
          suggestion: "Use textContent or properly sanitize the input before setting innerHTML",
          category: "Security"
        },
        {
          id: "issue-4",
          type: "error",
          severity: "high",
          title: "Undefined Variable Reference",
          description: "Variable 'apiKey' is used but never declared in this scope.",
          line: 8,
          column: 15,
          codeSnippet: "headers: { 'Authorization': `Bearer ${apiKey}` }",
          suggestion: "Declare apiKey variable or pass it as a parameter",
          category: "Syntax"
        }
      ],
      strengths: [
        "Good use of modern JavaScript features",
        "Consistent code formatting and indentation",
        "Appropriate use of const/let declarations",
        "Clear variable naming conventions"
      ],
      recommendations: [
        "Add comprehensive error handling for all API calls",
        "Implement input validation before processing user data",
        "Consider adding unit tests for the API integration logic",
        "Use environment variables for sensitive configuration"
      ],
      performanceInsights: [
        "API calls could be optimized with caching mechanisms",
        "Consider implementing request debouncing for user interactions",
        "Memory usage is within acceptable limits"
      ],
      securityAnalysis: {
        score: 65,
        vulnerabilities: [
          "Potential XSS vulnerability in DOM manipulation",
          "Missing input sanitization",
          "Hardcoded API endpoints could expose sensitive information"
        ],
        recommendations: [
          "Implement Content Security Policy (CSP)",
          "Use parameterized queries for database operations",
          "Store sensitive configuration in environment variables"
        ]
      },
      codeQuality: {
        readability: 85,
        maintainability: 78,
        efficiency: 82,
        testability: 70
      },
      estimatedReviewTime: 12,
      language: language,
      complexity: code.length > 500 ? "high" : code.length > 200 ? "medium" : "low"
    };

    setReview(mockReview);
    setIsReviewing(false);
    
    toast({
      title: "Code Review Complete",
      description: `Found ${mockReview.issues.length} issues. Overall score: ${mockReview.overallScore}/100`,
    });
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "security": return <XCircle className="h-4 w-4 text-red-600" />;
      case "suggestion": return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-amber-100 text-amber-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Code Review</h2>
        <p className="text-gray-600">
          Get instant feedback on your code quality, security, and performance
        </p>
      </div>

      {/* Code Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>Submit Code for Review</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programming Language
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger data-testid="language-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Type
                </label>
                <Select value={reviewType} onValueChange={setReviewType}>
                  <SelectTrigger data-testid="review-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive Review</SelectItem>
                    <SelectItem value="security">Security-Focused</SelectItem>
                    <SelectItem value="performance">Performance Analysis</SelectItem>
                    <SelectItem value="style">Code Style & Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Code
              </label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Paste your ${language} code here for AI review...
function fetchWeatherData(city) {
  fetch(\`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${apiKey}\`)
    .then(response => response.json())
    .then(data => {
      displayWeather(data);
    });
}

function displayWeather(data) {
  const temp = data.main.temp - 273.15;
  document.getElementById('temperature').innerHTML = \`\${temp}°C\`;
}`}
                rows={12}
                className="font-mono text-sm"
                data-testid="code-input"
              />
            </div>

            <Button
              onClick={performReview}
              disabled={!code.trim() || isReviewing}
              className="w-full"
              data-testid="review-code"
            >
              {isReviewing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  AI Analyzing Code...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Review My Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review Results */}
      {review && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(review.overallScore)}`}>
                  {review.overallScore}/100
                </div>
                <div className="text-lg font-medium text-gray-700">Overall Code Quality Score</div>
                <div className="text-sm text-gray-500">Review completed in {review.estimatedReviewTime} seconds</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{review.codeQuality.readability}%</div>
                  <div className="text-sm text-gray-600">Readability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{review.codeQuality.maintainability}%</div>
                  <div className="text-sm text-gray-600">Maintainability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{review.codeQuality.efficiency}%</div>
                  <div className="text-sm text-gray-600">Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{review.codeQuality.testability}%</div>
                  <div className="text-sm text-gray-600">Testability</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="issues" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="issues">Issues ({review.issues.length})</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="recommendations">Tips</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-4">
              <div className="space-y-3">
                {review.issues.map((issue) => (
                  <Card 
                    key={issue.id} 
                    className={`cursor-pointer transition-all ${
                      selectedIssue?.id === issue.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedIssue(selectedIssue?.id === issue.id ? null : issue)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{issue.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(issue.severity)}>
                                {issue.severity}
                              </Badge>
                              <Badge variant="outline">{issue.category}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                          {issue.line && (
                            <div className="text-xs text-gray-500">
                              Line {issue.line}, Column {issue.column}
                            </div>
                          )}
                          
                          {selectedIssue?.id === issue.id && (
                            <div className="mt-4 space-y-3 border-t pt-3">
                              {issue.codeSnippet && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-1">Code:</h5>
                                  <pre className="bg-red-50 border border-red-200 rounded p-2 text-xs">
                                    <code>{issue.codeSnippet}</code>
                                  </pre>
                                </div>
                              )}
                              {issue.suggestion && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-1">Suggested Fix:</h5>
                                  <pre className="bg-green-50 border border-green-200 rounded p-2 text-xs">
                                    <code>{issue.suggestion}</code>
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Security Analysis</span>
                    <div className={`text-2xl font-bold ${getScoreColor(review.securityAnalysis.score)}`}>
                      {review.securityAnalysis.score}/100
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={review.securityAnalysis.score} className="h-2" />
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Vulnerabilities Found</h4>
                      <ul className="space-y-1">
                        {review.securityAnalysis.vulnerabilities.map((vuln, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            {vuln}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Security Recommendations</h4>
                      <ul className="space-y-1">
                        {review.securityAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strengths" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Code Strengths</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {review.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-blue-500" />
                    <span>Improvement Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {review.recommendations.map((rec, index) => (
                      <li key={index} className="border-l-4 border-blue-200 pl-4">
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <span>Performance Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Code Complexity:</strong> {review.complexity.charAt(0).toUpperCase() + review.complexity.slice(1)} 
                        - Consider breaking down large functions for better maintainability.
                      </AlertDescription>
                    </Alert>
                    
                    <ul className="space-y-2">
                      {review.performanceInsights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <Zap className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
