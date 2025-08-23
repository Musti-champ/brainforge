import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Container, Cloud, Activity, Shield, GitBranch, Monitor, Zap, Play, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import CodeEditor from "./CodeEditor";

interface DeploymentChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  dockerfileTemplate: string;
  cicdConfig: string;
  deploymentUrl?: string;
  monitoringEndpoints: string[];
  xpReward: number;
  estimatedTime: number;
  completedCount: number;
  isActive: boolean;
  requirements: string[];
  steps: Array<{
    title: string;
    description: string;
    isCompleted: boolean;
  }>;
}

interface DeploymentProgress {
  challengeId: string;
  currentStep: number;
  deploymentStatus: "pending" | "building" | "deploying" | "success" | "failed";
  logs: string[];
  deploymentUrl?: string;
  healthChecksPassed: boolean;
}

export default function DevOpsChallenges() {
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [dockerfileCode, setDockerfileCode] = useState("");
  const [cicdCode, setCicdCode] = useState("");
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock DevOps challenges
  const mockChallenges: DeploymentChallenge[] = [
    {
      id: "devops-1",
      title: "Containerize REST API",
      description: "Create a Docker container for a Node.js REST API with proper optimization and security practices.",
      difficulty: "intermediate",
      category: "containerization",
      dockerfileTemplate: `FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]`,
      cicdConfig: `name: Deploy API
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: docker build -t api .
      - run: docker push api:latest`,
      monitoringEndpoints: ["/health", "/metrics", "/ready", "/api/status"],
      xpReward: 500,
      estimatedTime: 45,
      completedCount: 156,
      isActive: true,
      requirements: [
        "Multi-stage Docker build",
        "Non-root user for security",
        "Health check endpoint",
        "Environment variable configuration"
      ],
      steps: [
        { title: "Write Dockerfile", description: "Create optimized Docker container", isCompleted: false },
        { title: "Configure CI/CD", description: "Set up automated deployment pipeline", isCompleted: false },
        { title: "Deploy Application", description: "Deploy to cloud platform", isCompleted: false },
        { title: "Monitor & Test", description: "Verify deployment health", isCompleted: false }
      ]
    },
    {
      id: "devops-2",
      title: "Kubernetes Deployment",
      description: "Deploy a microservice to Kubernetes with proper scaling and monitoring.",
      difficulty: "advanced",
      category: "orchestration",
      dockerfileTemplate: `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
USER node
CMD ["npm", "start"]`,
      cicdConfig: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: api:latest
        ports:
        - containerPort: 8080`,
      monitoringEndpoints: ["/health", "/metrics", "/ready"],
      xpReward: 800,
      estimatedTime: 90,
      completedCount: 78,
      isActive: true,
      requirements: [
        "Kubernetes manifests",
        "Resource limits and requests",
        "Horizontal Pod Autoscaler",
        "Service and Ingress configuration"
      ],
      steps: [
        { title: "Create K8s Manifests", description: "Write deployment and service configs", isCompleted: false },
        { title: "Configure Scaling", description: "Set up auto-scaling rules", isCompleted: false },
        { title: "Deploy to Cluster", description: "Apply manifests to K8s", isCompleted: false },
        { title: "Verify Deployment", description: "Check pods and services", isCompleted: false }
      ]
    },
    {
      id: "devops-3",
      title: "CI/CD Pipeline Setup",
      description: "Build a complete CI/CD pipeline with testing, building, and deployment automation.",
      difficulty: "intermediate",
      category: "automation",
      dockerfileTemplate: `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "serve"]`,
      cicdConfig: `name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: docker build -t app .
      - run: docker push app:\${{ github.sha }}
      - run: kubectl set image deployment/app app=app:\${{ github.sha }}`,
      monitoringEndpoints: ["/health", "/metrics"],
      xpReward: 600,
      estimatedTime: 60,
      completedCount: 234,
      isActive: true,
      requirements: [
        "Automated testing",
        "Build artifacts",
        "Deployment automation",
        "Rollback capability"
      ],
      steps: [
        { title: "Setup Testing", description: "Configure automated tests", isCompleted: false },
        { title: "Build Pipeline", description: "Create build automation", isCompleted: false },
        { title: "Deploy Pipeline", description: "Automate deployment process", isCompleted: false },
        { title: "Monitor Pipeline", description: "Set up pipeline monitoring", isCompleted: false }
      ]
    }
  ];

  // Mock deployment progress
  const mockProgress: DeploymentProgress = {
    challengeId: selectedChallenge || "",
    currentStep: 2,
    deploymentStatus: "building",
    logs: [
      "[2025-01-15 22:05:00] Starting deployment process...",
      "[2025-01-15 22:05:02] Building Docker image...",
      "[2025-01-15 22:05:15] Image built successfully: api-server:latest",
      "[2025-01-15 22:05:16] Running container health checks...",
      "[2025-01-15 22:05:18] Health check passed ✓",
      "[2025-01-15 22:05:20] Deploying to cloud platform..."
    ],
    deploymentUrl: "https://api-server-abc123.replit.app",
    healthChecksPassed: true
  };

  // Start deployment
  const startDeploymentMutation = useMutation({
    mutationFn: async (data: { challengeId: string; dockerfile: string; cicdConfig: string }) => {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { deploymentUrl: "https://api-server-abc123.replit.app", status: "success" };
    },
    onSuccess: (data) => {
      setDeploymentLogs([...deploymentLogs, "Deployment started successfully!"]);
      queryClient.invalidateQueries({ queryKey: ["/api/deployment-progress"] });
      toast({
        title: "Deployment Started",
        description: "Your containerized application is being deployed.",
      });
    },
  });

  // Run health checks
  const runHealthChecksMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { passedChecks: 4, totalChecks: 4, allPassed: true };
    },
    onSuccess: (data) => {
      toast({
        title: "Health Checks Completed",
        description: `${data.passedChecks}/${data.totalChecks} checks passed.`,
        variant: data.allPassed ? "default" : "destructive"
      });
    },
  });

  const selectedChallengeData = mockChallenges.find(c => c.id === selectedChallenge);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-600";
      case "failed": return "text-red-600";
      case "building": case "deploying": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      case "building": case "deploying": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-amber-100 text-amber-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "containerization": return <Container className="h-5 w-5 text-blue-600" />;
      case "orchestration": return <Cloud className="h-5 w-5 text-purple-600" />;
      case "automation": return <GitBranch className="h-5 w-5 text-green-600" />;
      case "monitoring": return <Activity className="h-5 w-5 text-orange-600" />;
      case "security": return <Shield className="h-5 w-5 text-red-600" />;
      default: return <Zap className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">DevOps Challenges</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master containerization, orchestration, and deployment automation with hands-on DevOps challenges.
          </p>
        </div>

        {!selectedChallenge && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockChallenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedChallenge(challenge.id);
                  setDockerfileCode(challenge.dockerfileTemplate);
                  setCicdCode(challenge.cicdConfig);
                }}
                data-testid={`challenge-${challenge.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(challenge.category)}
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-bold text-primary">+{challenge.xpReward} XP</div>
                      <div className="text-gray-600">{challenge.estimatedTime}m</div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-2">{challenge.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{challenge.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {challenge.completedCount} completed
                    </div>
                    <Button size="sm">
                      Start Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedChallengeData && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(selectedChallengeData.category)}
                      <span>{selectedChallengeData.title}</span>
                      <Badge className={getDifficultyColor(selectedChallengeData.difficulty)}>
                        {selectedChallengeData.difficulty}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">+{selectedChallengeData.xpReward} XP</div>
                      <div className="text-sm text-gray-600">{selectedChallengeData.estimatedTime} minutes</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">{selectedChallengeData.description}</p>

                  {/* Progress Steps */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-medium text-gray-900">Challenge Steps</h4>
                    <div className="space-y-3">
                      {selectedChallengeData.steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                            ${step.isCompleted ? 'bg-green-500 text-white' :
                              mockProgress.currentStep === index + 1 ? 'bg-blue-500 text-white' :
                              'bg-gray-200 text-gray-600'}
                          `}>
                            {step.isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{step.title}</h5>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <h4 className="font-medium mb-1">Requirements</h4>
                      <ul className="text-sm space-y-1">
                        {selectedChallengeData.requirements.map((req, index) => (
                          <li key={index}>• {req}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuration Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="dockerfile" className="w-full">
                    <TabsList>
                      <TabsTrigger value="dockerfile">Dockerfile</TabsTrigger>
                      <TabsTrigger value="cicd">CI/CD Config</TabsTrigger>
                    </TabsList>
                    <TabsContent value="dockerfile">
                      <CodeEditor
                        language="dockerfile"
                        code={dockerfileCode}
                        readOnly={false}
                        onChange={setDockerfileCode}
                      />
                    </TabsContent>
                    <TabsContent value="cicd">
                      <CodeEditor
                        language="yaml"
                        code={cicdCode}
                        readOnly={false}
                        onChange={setCicdCode}
                      />
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Deployment Status</h4>
                      <Badge className={getStatusBadge(mockProgress.deploymentStatus)}>
                        {mockProgress.deploymentStatus}
                      </Badge>
                    </div>

                    {mockProgress.deploymentUrl && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-green-800">Deployment URL</div>
                            <code className="text-sm text-green-700">{mockProgress.deploymentUrl}</code>
                          </div>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => startDeploymentMutation.mutate({
                          challengeId: selectedChallenge!,
                          dockerfile: dockerfileCode,
                          cicdConfig: cicdCode
                        })}
                        disabled={startDeploymentMutation.isPending || !dockerfileCode.trim()}
                        data-testid="start-deployment"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {startDeploymentMutation.isPending ? "Deploying..." : "Start Deployment"}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => runHealthChecksMutation.mutate(selectedChallenge!)}
                        disabled={runHealthChecksMutation.isPending || !mockProgress.deploymentUrl}
                        data-testid="run-health-checks"
                      >
                        <Monitor className="h-4 w-4 mr-2" />
                        Run Health Checks
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deployment Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                    {mockProgress.logs.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-secondary" />
                    <span>Monitoring & Health Checks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedChallengeData.monitoringEndpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{endpoint}</code>
                          <div className="text-xs text-gray-600 mt-1">
                            {endpoint === "/health" && "Application health status"}
                            {endpoint === "/metrics" && "Prometheus metrics endpoint"}
                            {endpoint === "/ready" && "Readiness probe endpoint"}
                            {endpoint === "/api/status" && "API status and version info"}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {mockProgress.healthChecksPassed ? "✓" : "⏳"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📚 DevOps Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <Container className="h-4 w-4 mr-2" />
                      Docker Documentation
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Cloud className="h-4 w-4 mr-2" />
                      Kubernetes Guide
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <GitBranch className="h-4 w-4 mr-2" />
                      CI/CD Best Practices
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🎯 Challenge Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{mockProgress.currentStep}/4 steps</span>
                    </div>
                    <Progress value={(mockProgress.currentStep / 4) * 100} />
                    <Button
                      className="w-full"
                      onClick={() => setSelectedChallenge(null)}
                    >
                      Back to Challenges
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}