import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, Globe, Github, Linkedin, Award, Download, Share, Eye, EyeOff, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  id: string;
  userId: string;
  isPublic: boolean;
  bio: string;
  githubUsername: string;
  linkedinUrl: string;
  websiteUrl: string;
  featuredChallenges: string[];
  skillHighlights: string[];
  updatedAt: string;
}

interface Certificate {
  id: string;
  skillTrack: string;
  issuedAt: string;
  verificationCode: string;
  challengesCompleted: string[];
}

export default function ProfessionalPortfolio({ userId }: { userId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [portfolioData, setPortfolioData] = useState<Partial<Portfolio>>({
    isPublic: true,
    bio: "",
    githubUsername: "",
    linkedinUrl: "",
    websiteUrl: "",
    featuredChallenges: [],
    skillHighlights: []
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user data
  const { data: user } = useQuery({
    queryKey: ["/api/users", userId],
  });

  // Get portfolio
  const { data: portfolio } = useQuery({
    queryKey: ["/api/portfolios", userId],
    onSuccess: (data) => {
      if (data) {
        setPortfolioData(data);
      }
    }
  });

  // Get certificates
  const { data: certificates } = useQuery({
    queryKey: ["/api/certificates", userId],
  });

  // Get completed challenges
  const { data: completedChallenges } = useQuery({
    queryKey: ["/api/users", userId, "completed-challenges"],
  });

  // Mock data for demonstration
  const mockCertificates: Certificate[] = [
    {
      id: "cert-1",
      skillTrack: "REST API Fundamentals",
      issuedAt: "2025-08-10T00:00:00Z",
      verificationCode: "API-REST-2025-ABC123",
      challengesCompleted: ["challenge-1", "challenge-2"]
    },
    {
      id: "cert-2", 
      skillTrack: "API Authentication Mastery",
      issuedAt: "2025-08-14T00:00:00Z",
      verificationCode: "API-AUTH-2025-XYZ789",
      challengesCompleted: ["challenge-3"]
    }
  ];

  const mockCompletedChallenges = [
    {
      id: "challenge-1",
      title: "Your First API Call",
      difficulty: "beginner",
      completedAt: "2025-08-05T00:00:00Z",
      xpEarned: 100,
      solution: "fetch('https://api.quotable.io/random').then(r => r.json()).then(d => console.log(d))"
    },
    {
      id: "challenge-2",
      title: "Weather API Integration", 
      difficulty: "intermediate",
      completedAt: "2025-08-10T00:00:00Z",
      xpEarned: 250,
      solution: "Advanced weather API integration with error handling"
    },
    {
      id: "challenge-3",
      title: "OAuth 2.0 Flow Mastery",
      difficulty: "advanced", 
      completedAt: "2025-08-14T00:00:00Z",
      xpEarned: 500,
      solution: "Complete OAuth implementation with token management"
    }
  ];

  // Update portfolio
  const updatePortfolioMutation = useMutation({
    mutationFn: async (data: Partial<Portfolio>) => {
      return apiRequest("PUT", `/api/portfolios/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", userId] });
      setIsEditing(false);
      toast({
        title: "Portfolio Updated",
        description: "Your professional portfolio has been saved.",
      });
    },
  });

  // Generate portfolio PDF
  const generatePDFMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/portfolios/${userId}/export-pdf`);
    },
    onSuccess: (data) => {
      // Handle PDF download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = `${user?.username}-portfolio.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Portfolio Exported",
        description: "Your portfolio PDF has been downloaded.",
      });
    },
  });

  const handleSavePortfolio = () => {
    updatePortfolioMutation.mutate(portfolioData);
  };

  const addSkillHighlight = (skill: string) => {
    if (skill && !portfolioData.skillHighlights?.includes(skill)) {
      setPortfolioData(prev => ({
        ...prev,
        skillHighlights: [...(prev.skillHighlights || []), skill]
      }));
    }
  };

  const removeSkillHighlight = (skill: string) => {
    setPortfolioData(prev => ({
      ...prev,
      skillHighlights: prev.skillHighlights?.filter(s => s !== skill) || []
    }));
  };

  const addFeaturedChallenge = (challengeId: string) => {
    if (challengeId && !portfolioData.featuredChallenges?.includes(challengeId)) {
      setPortfolioData(prev => ({
        ...prev,
        featuredChallenges: [...(prev.featuredChallenges || []), challengeId]
      }));
    }
  };

  const removeFeaturedChallenge = (challengeId: string) => {
    setPortfolioData(prev => ({
      ...prev,
      featuredChallenges: prev.featuredChallenges?.filter(c => c !== challengeId) || []
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-amber-100 text-amber-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const publicPortfolioUrl = `${window.location.origin}/portfolio/${userId}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Professional Portfolio</span>
            </span>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {portfolioData.isPublic ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                <span className="text-sm text-gray-600">
                  {portfolioData.isPublic ? "Public" : "Private"}
                </span>
                <Switch
                  checked={portfolioData.isPublic}
                  onCheckedChange={(checked) => 
                    setPortfolioData(prev => ({ ...prev, isPublic: checked }))
                  }
                  data-testid="portfolio-visibility-toggle"
                />
              </div>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => {
                  if (isEditing) {
                    handleSavePortfolio();
                  } else {
                    setIsEditing(true);
                  }
                }}
                disabled={updatePortfolioMutation.isPending}
                data-testid="edit-portfolio"
              >
                {isEditing ? (updatePortfolioMutation.isPending ? "Saving..." : "Save Changes") : "Edit Portfolio"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {portfolioData.isPublic && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Public Portfolio URL</h4>
                  <p className="text-sm text-blue-700 font-mono">{publicPortfolioUrl}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(publicPortfolioUrl);
                    toast({ title: "URL Copied", description: "Portfolio URL copied to clipboard." });
                  }}
                  data-testid="copy-portfolio-url"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Bio
                </label>
                {isEditing ? (
                  <Textarea
                    value={portfolioData.bio || ""}
                    onChange={(e) => setPortfolioData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell others about your API development experience..."
                    rows={4}
                    data-testid="bio-input"
                  />
                ) : (
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                    {portfolioData.bio || "No bio provided yet."}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub Username
                </label>
                {isEditing ? (
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      github.com/
                    </span>
                    <Input
                      value={portfolioData.githubUsername || ""}
                      onChange={(e) => setPortfolioData(prev => ({ ...prev, githubUsername: e.target.value }))}
                      placeholder="username"
                      className="rounded-l-none"
                      data-testid="github-input"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Github className="h-4 w-4 text-gray-500" />
                    {portfolioData.githubUsername ? (
                      <a
                        href={`https://github.com/${portfolioData.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        github.com/{portfolioData.githubUsername}
                      </a>
                    ) : (
                      <span className="text-gray-500">Not provided</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Profile
                </label>
                {isEditing ? (
                  <Input
                    value={portfolioData.linkedinUrl || ""}
                    onChange={(e) => setPortfolioData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourprofile"
                    data-testid="linkedin-input"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Linkedin className="h-4 w-4 text-gray-500" />
                    {portfolioData.linkedinUrl ? (
                      <a
                        href={portfolioData.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    ) : (
                      <span className="text-gray-500">Not provided</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Website
                </label>
                {isEditing ? (
                  <Input
                    value={portfolioData.websiteUrl || ""}
                    onChange={(e) => setPortfolioData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                    data-testid="website-input"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    {portfolioData.websiteUrl ? (
                      <a
                        href={portfolioData.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Personal Website
                      </a>
                    ) : (
                      <span className="text-gray-500">Not provided</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-secondary" />
                <span>Certifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mockCertificates.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
                  <p className="text-gray-600">Complete skill tracks to earn certificates.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockCertificates.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Award className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">{cert.skillTrack}</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Issued:</span>
                          <span className="text-gray-900">
                            {new Date(cert.issuedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Verification:</span>
                          <span className="text-gray-900 font-mono text-xs">
                            {cert.verificationCode}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Challenges:</span>
                          <span className="text-gray-900">
                            {cert.challengesCompleted.length} completed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isEditing && (
                  <div className="flex space-x-2">
                    <Select onValueChange={addSkillHighlight}>
                      <SelectTrigger className="w-64" data-testid="skill-select">
                        <SelectValue placeholder="Add a skill..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REST APIs">REST APIs</SelectItem>
                        <SelectItem value="GraphQL">GraphQL</SelectItem>
                        <SelectItem value="OAuth 2.0">OAuth 2.0</SelectItem>
                        <SelectItem value="API Testing">API Testing</SelectItem>
                        <SelectItem value="Webhook Integration">Webhook Integration</SelectItem>
                        <SelectItem value="Rate Limiting">Rate Limiting</SelectItem>
                        <SelectItem value="API Documentation">API Documentation</SelectItem>
                        <SelectItem value="Microservices">Microservices</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {(portfolioData.skillHighlights || []).map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="flex items-center space-x-1"
                    >
                      <Star className="h-3 w-3" />
                      <span>{skill}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeSkillHighlight(skill)}
                          className="ml-1 text-gray-500 hover:text-red-500"
                          data-testid={`remove-skill-${index}`}
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                
                {(portfolioData.skillHighlights || []).length === 0 && (
                  <p className="text-gray-500 text-sm">No skills highlighted yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Featured Challenge Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isEditing && (
                  <div className="flex space-x-2">
                    <Select onValueChange={addFeaturedChallenge}>
                      <SelectTrigger className="w-64" data-testid="challenge-select">
                        <SelectValue placeholder="Feature a challenge..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCompletedChallenges
                          .filter(c => !portfolioData.featuredChallenges?.includes(c.id))
                          .map((challenge) => (
                            <SelectItem key={challenge.id} value={challenge.id}>
                              {challenge.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  {(portfolioData.featuredChallenges || []).map((challengeId) => {
                    const challenge = mockCompletedChallenges.find(c => c.id === challengeId);
                    if (!challenge) return null;
                    
                    return (
                      <div key={challengeId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getDifficultyColor(challenge.difficulty)}>
                                {challenge.difficulty}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                +{challenge.xpEarned} XP
                              </span>
                              <span className="text-sm text-gray-600">
                                Completed {new Date(challenge.completedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => removeFeaturedChallenge(challengeId)}
                              className="text-gray-500 hover:text-red-500"
                              data-testid={`remove-challenge-${challengeId}`}
                            >
                              ×
                            </button>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 rounded p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Solution:</h5>
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                            {challenge.solution}
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {(portfolioData.featuredChallenges || []).length === 0 && (
                  <p className="text-gray-500 text-sm">No featured challenges yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Resume Export</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Generate a professional PDF resume showcasing your API development skills and achievements.
                  </p>
                  <Button
                    onClick={() => generatePDFMutation.mutate()}
                    disabled={generatePDFMutation.isPending}
                    data-testid="export-pdf"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {generatePDFMutation.isPending ? "Generating..." : "Download PDF Resume"}
                  </Button>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">LinkedIn Integration</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Add your API Puzzle Quest achievements to your LinkedIn profile.
                  </p>
                  <Button variant="outline" data-testid="linkedin-share">
                    <Linkedin className="h-4 w-4 mr-2" />
                    Share on LinkedIn
                  </Button>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Developer Profile</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Showcase your skills on your personal website or GitHub profile.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Embed Code:</h5>
                    <pre className="text-xs bg-white border rounded p-2 overflow-x-auto">
{`<iframe 
  src="${publicPortfolioUrl}/embed" 
  width="400" 
  height="300" 
  frameborder="0">
</iframe>`}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(`<iframe src="${publicPortfolioUrl}/embed" width="400" height="300" frameborder="0"></iframe>`);
                        toast({ title: "Code Copied", description: "Embed code copied to clipboard." });
                      }}
                      data-testid="copy-embed-code"
                    >
                      Copy Embed Code
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}