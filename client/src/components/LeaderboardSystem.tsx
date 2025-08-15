import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award, TrendingUp, Users, Star, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface LeaderboardUser {
  id: string;
  username: string;
  level: number;
  xp: number;
  rank: number;
  streak: number;
  completedChallenges: number;
  badges: string[];
  avatar?: string;
  weeklyXp: number;
  monthlyXp: number;
}

export default function LeaderboardSystem() {
  const [timeframe, setTimeframe] = useState("all-time");

  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/user-1"],
  });

  // Mock leaderboard data - in real app this would come from API
  const leaderboardUsers: LeaderboardUser[] = [
    {
      id: "user-1",
      username: "developer",
      level: 5,
      xp: 1250,
      rank: 156,
      streak: 7,
      completedChallenges: 23,
      badges: ["rest-master", "auth-expert"],
      weeklyXp: 450,
      monthlyXp: 1250
    },
    {
      id: "user-2",
      username: "api_ninja",
      level: 12,
      xp: 3680,
      rank: 1,
      streak: 28,
      completedChallenges: 89,
      badges: ["rest-master", "auth-expert", "graphql-wizard", "speed-demon"],
      weeklyXp: 680,
      monthlyXp: 2100
    },
    {
      id: "user-3",
      username: "code_explorer",
      level: 10,
      xp: 2850,
      rank: 2,
      streak: 15,
      completedChallenges: 67,
      badges: ["rest-master", "auth-expert", "consistent-learner"],
      weeklyXp: 520,
      monthlyXp: 1890
    },
    {
      id: "user-4",
      username: "rest_warrior",
      level: 9,
      xp: 2340,
      rank: 3,
      streak: 12,
      completedChallenges: 54,
      badges: ["rest-master", "quick-learner"],
      weeklyXp: 380,
      monthlyXp: 1456
    },
    {
      id: "user-5",
      username: "query_master",
      level: 8,
      xp: 2100,
      rank: 4,
      streak: 9,
      completedChallenges: 48,
      badges: ["graphql-wizard", "problem-solver"],
      weeklyXp: 320,
      monthlyXp: 1200
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getBadgeColor = (badge: string) => {
    const colors = {
      "rest-master": "bg-blue-100 text-blue-800",
      "auth-expert": "bg-red-100 text-red-800",
      "graphql-wizard": "bg-purple-100 text-purple-800",
      "speed-demon": "bg-green-100 text-green-800",
      "consistent-learner": "bg-amber-100 text-amber-800",
      "quick-learner": "bg-pink-100 text-pink-800",
      "problem-solver": "bg-indigo-100 text-indigo-800"
    };
    return colors[badge as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatBadgeName = (badge: string) => {
    return badge.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const sortedUsers = [...leaderboardUsers].sort((a, b) => {
    switch (timeframe) {
      case "weekly":
        return b.weeklyXp - a.weeklyXp;
      case "monthly":
        return b.monthlyXp - a.monthlyXp;
      default:
        return a.rank - b.rank;
    }
  });

  const currentUserRank = sortedUsers.findIndex(user => user.id === currentUser?.id) + 1;
  const usersAbove = sortedUsers.slice(Math.max(0, currentUserRank - 3), currentUserRank - 1);
  const usersBelow = sortedUsers.slice(currentUserRank, currentUserRank + 2);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Leaderboard</h2>
        <p className="text-gray-600">Compete with developers worldwide and showcase your API skills</p>
      </div>

      <Tabs value={timeframe} onValueChange={setTimeframe} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-time">All Time</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe} className="space-y-6">
          {/* Top 3 Podium */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Top Performers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sortedUsers.slice(0, 3).map((user, index) => (
                  <Card key={user.id} className={`
                    ${index === 0 ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''}
                    ${index === 1 ? 'ring-2 ring-gray-200 bg-gray-50' : ''}
                    ${index === 2 ? 'ring-2 ring-amber-200 bg-amber-50' : ''}
                  `}>
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3">
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-lg font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-1">{user.username}</h3>
                      <div className="text-sm text-gray-600 mb-2">Level {user.level}</div>
                      
                      <div className="text-lg font-bold text-primary mb-2">
                        {timeframe === "weekly" ? user.weeklyXp : 
                         timeframe === "monthly" ? user.monthlyXp : user.xp} XP
                      </div>
                      
                      <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
                        <span>{user.completedChallenges} challenges</span>
                        <span>•</span>
                        <span>{user.streak} day streak</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Your Position */}
          {currentUser && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span>Your Position</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary text-white rounded-full font-bold">
                    #{currentUserRank}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{currentUser.username}</h3>
                    <div className="text-sm text-gray-600">Level {currentUser.level}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {timeframe === "weekly" ? leaderboardUsers[0].weeklyXp : 
                       timeframe === "monthly" ? leaderboardUsers[0].monthlyXp : currentUser.xp} XP
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentUser.completedChallenges} challenges completed
                    </div>
                  </div>
                </div>

                {currentUser.badges && currentUser.badges.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Your Badges:</div>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.badges.map((badge, index) => (
                        <Badge key={index} className={`text-xs ${getBadgeColor(badge)}`}>
                          {formatBadgeName(badge)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Full Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-secondary" />
                  <span>Full Rankings</span>
                </span>
                <Badge variant="outline">
                  {sortedUsers.length} active developers
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedUsers.map((user, index) => (
                  <div 
                    key={user.id}
                    className={`
                      flex items-center space-x-4 p-3 rounded-lg border
                      ${user.id === currentUser?.id ? 'bg-primary/5 border-primary/20' : 'border-gray-200'}
                      ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}
                    `}
                    data-testid={`leaderboard-user-${user.id}`}
                  >
                    <div className="flex items-center justify-center w-8 h-8">
                      {index < 3 ? getRankIcon(index + 1) : (
                        <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{user.username}</h4>
                        {user.id === currentUser?.id && (
                          <Badge className="text-xs bg-primary text-white">You</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Level {user.level}</div>
                    </div>
                    
                    <div className="hidden md:block">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>{user.streak} day streak</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {timeframe === "weekly" ? user.weeklyXp : 
                         timeframe === "monthly" ? user.monthlyXp : user.xp} XP
                      </div>
                      <div className="text-sm text-gray-600">
                        {user.completedChallenges} completed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}