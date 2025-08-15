import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, CheckCircle, Circle, Star, Trophy, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SkillNode {
  id: string;
  title: string;
  description: string;
  category: string;
  prerequisites: string[];
  challenges: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
  xpReward: number;
}

export default function ProgressiveSkillTree() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ["/api/users/user-1"],
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/users/user-1/progress"],
  });

  // Define skill tree structure
  const skillNodes: SkillNode[] = [
    {
      id: "http-basics",
      title: "HTTP Fundamentals",
      description: "Learn the core concepts of HTTP protocol, methods, and status codes",
      category: "Foundation",
      prerequisites: [],
      challenges: ["challenge-1"],
      isUnlocked: true,
      isCompleted: true,
      progress: 100,
      xpReward: 200
    },
    {
      id: "rest-apis",
      title: "REST API Mastery",
      description: "Master RESTful API design principles and best practices",
      category: "Core",
      prerequisites: ["http-basics"],
      challenges: ["challenge-1", "challenge-2"],
      isUnlocked: true,
      isCompleted: false,
      progress: 60,
      xpReward: 400
    },
    {
      id: "api-auth",
      title: "API Authentication",
      description: "Implement secure authentication flows including OAuth and JWT",
      category: "Security",
      prerequisites: ["rest-apis"],
      challenges: ["challenge-3"],
      isUnlocked: true,
      isCompleted: false,
      progress: 30,
      xpReward: 600
    },
    {
      id: "graphql",
      title: "GraphQL Fundamentals",
      description: "Query APIs efficiently with GraphQL syntax and concepts",
      category: "Advanced",
      prerequisites: ["rest-apis"],
      challenges: [],
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
      xpReward: 500
    },
    {
      id: "api-testing",
      title: "API Testing & Debugging",
      description: "Test APIs thoroughly and debug common issues",
      category: "Quality",
      prerequisites: ["rest-apis"],
      challenges: [],
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
      xpReward: 450
    },
    {
      id: "api-design",
      title: "API Design Patterns",
      description: "Design scalable and maintainable API architectures",
      category: "Architecture",
      prerequisites: ["api-auth", "api-testing"],
      challenges: [],
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
      xpReward: 800
    }
  ];

  const getNodeIcon = (node: SkillNode) => {
    if (node.isCompleted) {
      return <CheckCircle className="h-6 w-6 text-secondary" />;
    } else if (node.isUnlocked) {
      return <Circle className="h-6 w-6 text-primary" />;
    } else {
      return <Lock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getNodeBorderColor = (node: SkillNode) => {
    if (node.isCompleted) return "border-secondary shadow-lg";
    if (node.isUnlocked) return "border-primary";
    return "border-gray-300";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Foundation": return "bg-blue-100 text-blue-800";
      case "Core": return "bg-green-100 text-green-800";
      case "Security": return "bg-red-100 text-red-800";
      case "Advanced": return "bg-purple-100 text-purple-800";
      case "Quality": return "bg-amber-100 text-amber-800";
      case "Architecture": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const selectedNodeData = selectedNode ? skillNodes.find(n => n.id === selectedNode) : null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">API Skill Tree</h2>
        <p className="text-gray-600">Progress through structured learning paths to master API development</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Tree Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                {/* Connection Lines - Simple grid layout */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                            refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
                    </marker>
                  </defs>
                  {/* Add connecting lines between prerequisites */}
                  <line x1="50%" y1="15%" x2="25%" y2="35%" stroke="#9CA3AF" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <line x1="50%" y1="15%" x2="75%" y2="35%" stroke="#9CA3AF" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <line x1="25%" y1="55%" x2="25%" y2="75%" stroke="#9CA3AF" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <line x1="75%" y1="55%" x2="75%" y2="75%" stroke="#9CA3AF" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <line x1="25%" y1="95%" x2="50%" y2="115%" stroke="#9CA3AF" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <line x1="75%" y1="95%" x2="50%" y2="115%" stroke="#9CA3AF" strokeWidth="2" markerEnd="url(#arrowhead)" />
                </svg>

                {/* Skill Nodes Grid */}
                <div className="relative grid grid-cols-2 gap-8 min-h-[500px]" style={{ zIndex: 1 }}>
                  {skillNodes.map((node, index) => (
                    <div 
                      key={node.id}
                      className={`
                        ${index === 0 ? 'col-span-2 mx-auto' : ''}
                        ${index === 5 ? 'col-span-2 mx-auto' : ''}
                        w-40 h-32
                      `}
                      style={{
                        gridRow: Math.floor(index / 2) + 1,
                      }}
                    >
                      <Card 
                        className={`
                          h-full cursor-pointer transition-all duration-200 
                          ${getNodeBorderColor(node)}
                          ${selectedNode === node.id ? 'ring-2 ring-primary' : ''}
                          ${node.isUnlocked ? 'hover:shadow-md' : 'opacity-60'}
                        `}
                        onClick={() => node.isUnlocked && setSelectedNode(node.id)}
                        data-testid={`skill-node-${node.id}`}
                      >
                        <CardContent className="p-3 h-full flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            {getNodeIcon(node)}
                            <Badge className={`text-xs ${getCategoryColor(node.category)}`}>
                              {node.category}
                            </Badge>
                          </div>
                          
                          <h3 className="font-medium text-sm text-gray-900 mb-1 leading-tight">
                            {node.title}
                          </h3>
                          
                          {node.isUnlocked && (
                            <div className="mt-auto">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>{node.progress}%</span>
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-accent mr-1" />
                                  <span>{node.xpReward}</span>
                                </div>
                              </div>
                              <Progress value={node.progress} className="h-1" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Node Details Panel */}
        <div>
          {selectedNodeData ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {getNodeIcon(selectedNodeData)}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {selectedNodeData.title}
                      </h3>
                      <Badge className={getCategoryColor(selectedNodeData.category)}>
                        {selectedNodeData.category}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm">
                    {selectedNodeData.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>{selectedNodeData.progress}% Complete</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-accent mr-1" />
                          <span>{selectedNodeData.xpReward} XP</span>
                        </div>
                      </div>
                      <Progress value={selectedNodeData.progress} className="h-2" />
                    </div>

                    {selectedNodeData.prerequisites.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Prerequisites</h4>
                        <div className="space-y-1">
                          {selectedNodeData.prerequisites.map((prereq, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                              <span className="text-gray-600">{prereq.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedNodeData.challenges.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Challenges ({selectedNodeData.challenges.length})
                        </h4>
                        <div className="space-y-1">
                          {selectedNodeData.challenges.map((challenge, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <Target className="h-4 w-4 text-primary mr-2" />
                              <span className="text-gray-600">Challenge {index + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    {selectedNodeData.isCompleted ? (
                      <div className="flex items-center text-secondary">
                        <Trophy className="h-5 w-5 mr-2" />
                        <span className="font-medium">Completed!</span>
                      </div>
                    ) : selectedNodeData.isUnlocked ? (
                      <Button 
                        className="w-full"
                        data-testid="continue-skill"
                      >
                        Continue Learning
                      </Button>
                    ) : (
                      <div className="text-center text-gray-500">
                        <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">Complete prerequisites to unlock</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-medium text-lg mb-2">Select a Skill Node</h3>
                  <p className="text-sm">
                    Click on any unlocked skill node to view details and continue your learning journey.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}