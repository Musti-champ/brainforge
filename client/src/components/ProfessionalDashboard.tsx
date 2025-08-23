
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Code, 
  ExternalLink,
  GitBranch,
  Server,
  Zap
} from "lucide-react";

interface UserStats {
  totalChallenges: number;
  completedChallenges: number;
  currentStreak: number;
  averageScore: number;
}

interface UserProfile {
  user: {
    id: string;
    username: string;
    email: string;
    level: number;
    totalXp: number;
    currentStreak: number;
  };
  stats: UserStats;
  completedChallenges: any[];
  recentActivity: any[];
}

export default function ProfessionalDashboard() {
  const [userId] = useState("user-1"); // In production, get from auth context

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/portfolio", userId],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const response = await fetch("/api/leaderboard?limit=10");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
          <p className="text-gray-600 mt-2">Unable to load user profile.</p>
        </div>
      </div>
    );
  }

  const completionRate = (profile.stats.completedChallenges / profile.stats.totalChallenges) * 100;
  const nextLevelXp = (profile.user.level + 1) * 1000;
  const currentLevelProgress = ((profile.user.totalXp % 1000) / 1000) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.user.username}</h1>
            <p className="text-gray-600 mt-1">Professional API Developer</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              Level {profile.user.level}
            </Badge>
            <Badge className="bg-blue-600 text-lg px-3 py-1">
              {profile.user.totalXp} XP
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{profile.stats.completedChallenges}</p>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{completionRate.toFixed(1)}%</p>
                <p className="text-gray-600">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{profile.user.currentStreak}</p>
                <p className="text-gray-600">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{profile.stats.averageScore.toFixed(0)}</p>
                <p className="text-gray-600">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Level Progress</CardTitle>
                <CardDescription>
                  {1000 - (profile.user.totalXp % 1000)} XP to Level {profile.user.level + 1}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={currentLevelProgress} className="h-3" />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>{profile.user.totalXp % 1000} XP</span>
                  <span>{nextLevelXp} XP</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest challenges and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center">
                        <Code className="h-4 w-4 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium">Challenge Completed</p>
                          <p className="text-xs text-gray-600">
                            {new Date(activity.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{activity.score}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployments">
          <Card>
            <CardHeader>
              <CardTitle>Live Deployments</CardTitle>
              <CardDescription>Your active production deployments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.completedChallenges
                  .filter(c => c.metadata?.deploymentUrl)
                  .map((deployment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <Server className="h-8 w-8 text-green-500 mr-4" />
                      <div>
                        <h4 className="font-medium">API Challenge #{index + 1}</h4>
                        <p className="text-sm text-gray-600">
                          Deployed {new Date(deployment.completedAt).toLocaleDateString()}
                        </p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {deployment.metadata.deploymentUrl}
                        </code>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Live</Badge>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit
                      </Button>
                    </div>
                  </div>
                ))}
                {profile.completedChallenges.filter(c => c.metadata?.deploymentUrl).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active deployments yet</p>
                    <p className="text-sm">Complete DevOps challenges to deploy your projects</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>Top developers by XP and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard?.map((user: any, index: number) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-600">Level {user.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{user.totalXp} XP</p>
                      <p className="text-sm text-gray-600">{user.currentStreak} day streak</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>Professional Portfolio</CardTitle>
              <CardDescription>Showcase your API development skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Skills Demonstrated</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">REST APIs</Badge>
                      <Badge variant="secondary">GraphQL</Badge>
                      <Badge variant="secondary">Docker</Badge>
                      <Badge variant="secondary">CI/CD</Badge>
                      <Badge variant="secondary">Authentication</Badge>
                      <Badge variant="secondary">Database Design</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Achievements</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-sm">API Master (Level {profile.user.level})</span>
                      </div>
                      <div className="flex items-center">
                        <GitBranch className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">DevOps Expert</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Portfolio URL</h4>
                  <code className="bg-white px-3 py-2 rounded border text-sm">
                    https://api-puzzle-quest.replit.app/portfolio/{profile.user.id}
                  </code>
                  <Button variant="outline" size="sm" className="ml-3">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
