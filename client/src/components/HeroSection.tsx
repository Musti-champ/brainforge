import { useQuery } from "@tanstack/react-query";
import { Trophy, Clock, Star, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function HeroSection() {
  const { data: user } = useQuery({
    queryKey: ["/api/users/user-1"],
  });

  const progressToNextLevel = user ? ((user.xp % 300) / 300) * 100 : 0;
  const xpToNextLevel = user ? 300 - (user.xp % 300) : 250;

  return (
    <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, Developer!</h2>
                  <p className="text-gray-600">Ready to level up your API skills?</p>
                </div>
                {user && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary" data-testid="user-streak">{user.streak}</div>
                    <div className="text-sm text-gray-500">Day Streak</div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="h-5 w-5 text-accent" />
                      <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">Current Challenge</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">OAuth 2.0 Authentication Mastery</h3>
                    <p className="text-primary-100 mb-4">Master the art of secure API authentication with OAuth flows</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="text-sm">45 min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-accent" />
                        <span className="text-sm">250 XP</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Signal className="h-4 w-4 text-accent" />
                        <span className="text-sm">Intermediate</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  className="mt-4 bg-white text-primary hover:bg-gray-50"
                  data-testid="continue-challenge"
                >
                  Continue Challenge
                </Button>
              </div>

              {user && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-secondary/5 rounded-lg">
                    <div className="text-2xl font-bold text-secondary mb-1" data-testid="completed-challenges">
                      {user.completedChallenges}
                    </div>
                    <div className="text-sm text-gray-600">Challenges Completed</div>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <div className="text-2xl font-bold text-accent mb-1" data-testid="badges-earned">
                      {user.badges.length}
                    </div>
                    <div className="text-sm text-gray-600">Badges Earned</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1" data-testid="global-rank">
                      {user.rank}
                    </div>
                    <div className="text-sm text-gray-600">Global Rank</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {user && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Level Progress</h3>
                    <span className="text-sm text-gray-500">Level {user.level}</span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span data-testid="current-xp">{user.xp.toLocaleString()} XP</span>
                      <span data-testid="target-xp">{((Math.floor(user.xp / 300) + 1) * 300).toLocaleString()} XP</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-3" />
                  </div>
                  <p className="text-sm text-gray-600">{xpToNextLevel} XP until Level {user.level + 1}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                  <div className="space-y-3">
                    {user.badges.includes("rest-master") && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">REST Master</div>
                          <div className="text-xs text-gray-500">Completed 10 REST API challenges</div>
                        </div>
                      </div>
                    )}
                    {user.badges.includes("auth-expert") && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                          <Signal className="h-4 w-4 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">Security Expert</div>
                          <div className="text-xs text-gray-500">Mastered API authentication</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
