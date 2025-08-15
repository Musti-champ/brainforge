import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Container, Cloud, Activity, Shield, GitBranch, Monitor, Zap, Play, CheckCircle } from "lucide-react";
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

  // Get DevOps challenges
  const { data: challenges } = useQuery({
    queryKey: ["/api/deployment-challenges"],
  });

  // Get deployment progress
  const { data: progress } = useQuery({
    queryKey: ["/api/deployment-progress", selectedChallenge],
    enabled: !!selectedChallenge,
    refetchInterval: 2000, // Poll for real-time updates
  });

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

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

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
      - name: Build Docker image
        run: docker build -t api-server .
      - name: Run tests
        run: docker run --rm api-server npm test
      - name: Deploy to production
        run: echo "Deploying to production..."`,
      deploymentUrl: undefined,
      monitoringEndpoints: ["/health", "/metrics"],
      xpReward: 400,
      estimatedTime: 45,
      completedCount: 234,
      isActive: true,
      requirements: [
        "Create optimized Dockerfile",
        "Implement health checks",
        "Set up CI/CD pipeline",
        "Configure monitoring"
      ],
      steps: [
        {
          title: "Write Dockerfile",
          description: "Create an optimized, secure Dockerfile for the Node.js API",
          isCompleted: false
        },
        {
          title: "Set up CI/CD",
          description: "Configure GitHub Actions or similar CI/CD pipeline",
          isCompleted: false
        },
        {
          title: "Deploy Container",
          description: "Deploy the containerized application to a cloud platform",
          isCompleted: false
        },
        {
          title: "Configure Monitoring",
          description: "Set up health checks and monitoring endpoints",
          isCompleted: false
        }
      ]
    },
    {
      id: "devops-2",
      title: "Kubernetes API Deployment",
      description: "Deploy and scale an API using Kubernetes with proper resource management and auto-scaling.",
      difficulty: "advanced",
      category: "orchestration",
      dockerfileTemplate: `# Kubernetes deployment configuration`,
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
        image: your-api:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10`,
      deploymentUrl: undefined,
      monitoringEndpoints: ["/health", "/ready", "/metrics"],
      xpReward: 600,
      estimatedTime: 90,
      completedCount: 89,
      isActive: true,
      requirements: [
        "Create Kubernetes manifests",
        "Configure auto-scaling",
        "Set up load balancing",
        "Implement monitoring and logging"
      ],
      steps: [
        {
          title: "Create K8s Manifests",
          description: "Write Deployment, Service, and ConfigMap YAML files",
          isCompleted: false
        },
        {
          title: "Configure Auto-scaling",
          description: "Set up Horizontal Pod Autoscaler (HPA)",
          isCompleted: false
        },
        {
          title: "Deploy to Cluster",
          description: "Deploy application to Kubernetes cluster",
          isCompleted: false
        },
        {
          title: "Monitor Performance",
          description: "Verify scaling and performance metrics",
          isCompleted: false
        }
      ]
    },
    {
      id: "devops-3",
      title: "API Monitoring & Observability",
      description: "Implement comprehensive monitoring, logging, and alerting for production APIs.",
      difficulty: "advanced",
      category: "monitoring",
      dockerfileTemplate: `# Monitoring stack configuration`,
      cicdConfig: `version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - prometheus
      - grafana
  
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin`,
      deploymentUrl: undefined,
      monitoringEndpoints: ["/metrics", "/health", "/api/status"],
      xpReward: 500,
      estimatedTime: 75,
      completedCount: 156,
      isActive: true,
      requirements: [
        "Implement metrics collection",
        "Set up Prometheus monitoring",
        "Create Grafana dashboards",
        "Configure alerting rules"
      ],
      steps: [
        {
          title: "Add Metrics Endpoint",
          description: "Implement /metrics endpoint with Prometheus format",
          isCompleted: false
        },
        {
          title: "Deploy Monitoring Stack",
          description: "Set up Prometheus and Grafana with Docker Compose",
          isCompleted: false
        },
        {
          title: "Create Dashboards",
          description: "Build comprehensive monitoring dashboards",
          isCompleted: false
        },
        {
          title: "Configure Alerts",
          description: "Set up alerting for critical metrics and errors",
          isCompleted: false
        }
      ]
    }
  ];

  // Mock deployment progress
  const mockProgress: DeploymentProgress = {
    challengeId: selectedChallenge || "",
    currentStep: 1,
    deploymentStatus: "building",
    logs: [
      "[2025-08-15 22:05:00] Starting deployment process...",
      "[2025-08-15 22:05:02] Building Docker image...",
      "[2025-08-15 22:05:15] Image built successfully: api-server:latest",
      "[2025-08-15 22:05:16] Running container health checks...",
      "[2025-08-15 22:05:18] Health check passed ✓",
      "[2025-08-15 22:05:20] Deploying to cloud platform..."
    ],
    deploymentUrl: undefined,
    healthChecksPassed: true
  };

  // Start deployment
  const startDeploymentMutation = useMutation({
    mutationFn: async (data: { challengeId: string; dockerfile: string; cicdConfig: string }) => {
      return apiRequest("POST", "/api/deployment-challenges/deploy", data);
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
      return apiRequest("POST", `/api/deployment-challenges/${challengeId}/health-check`);
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
      case "containerization": return <Container className="h-5 w-5" />;
      case "orchestration": return <Cloud className="h-5 w-5" />;
      case "monitoring": return <Monitor className="h-5 w-5" />;
      case "security": return <Shield className="h-5 w-5" />;
      case "cicd": return <GitBranch className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  if (!selectedChallenge) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">DevOps & Deployment Challenges</h2>
          <p className="text-gray-600">
            Master containerization, orchestration, CI/CD, and monitoring with real-world deployment scenarios
          </p>
        </div>

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

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Requirements</span>
                      <span className="text-gray-600">{challenge.requirements.length} steps</span>
                    </div>
                    <div className="space-y-1">
                      {challenge.requirements.slice(0, 2).map((req, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-center">
                          <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                          {req}
                        </div>
                      ))}
                      {challenge.requirements.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{challenge.requirements.length - 2} more...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completed by {challenge.completedCount} developers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedChallenge(null);
              setDockerfileCode("");
              setCicdCode("");
            }}
            data-testid="back-to-challenges"
          >
            ← Back to Challenges
          </Button>
        </div>
      </div>

      {selectedChallengeData && (
        <>
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
                        ${step.isCompleted 
                          ? 'bg-green-100 text-green-800' 
                          : index === mockProgress.currentStep 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {step.isCompleted ? <CheckCircle className="h-3 w-3" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{step.title}</h5>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Tabs defaultValue="dockerfile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dockerfile">Dockerfile</TabsTrigger>
                  <TabsTrigger value="cicd">CI/CD Config</TabsTrigger>
                  <TabsTrigger value="deployment">Deployment</TabsTrigger>
                </TabsList>

                <TabsContent value="dockerfile" className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Dockerfile Configuration</h4>
                    <CodeEditor
                      language="dockerfile"
                      code={dockerfileCode}
                      onChange={setDockerfileCode}
                      readOnly={false}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="cicd" className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">CI/CD Pipeline</h4>
                    <CodeEditor
                      language="yaml"
                      code={cicdCode}
                      onChange={setCicdCode}
                      readOnly={false}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="deployment" className="space-y-4">
                  <div className="space-y-6">
                    {/* Deployment Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            <span>Deployment Status</span>
                          </span>
                          <Badge className={getStatusBadge(mockProgress.deploymentStatus)}>
                            {mockProgress.deploymentStatus}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>{mockProgress.currentStep}/4 steps</span>
                            </div>
                            <Progress value={(mockProgress.currentStep / 4) * 100} />
                          </div>

                          {mockProgress.deploymentUrl && (
                            <Alert>
                              <CheckCircle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Deployment successful!</strong> Your application is running at:{" "}
                                <a 
                                  href={mockProgress.deploymentUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {mockProgress.deploymentUrl}
                                </a>
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="flex space-x-3">
                            <Button
                              onClick={() => startDeploymentMutation.mutate({
                                challengeId: selectedChallenge,
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
                              onClick={() => runHealthChecksMutation.mutate(selectedChallenge)}
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
                        <CardTitle className="flex items-center space-x-2">
                          <Container className="h-5 w-5 text-gray-500" />
                          <span>Deployment Logs</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 h-64 overflow-y-auto">
                          {mockProgress.logs.map((log, index) => (
                            <div key={index} className="mb-1">
                              {log}
                            </div>
                          ))}
                          {mockProgress.logs.length === 0 && (
                            <div className="text-gray-500">No deployment logs yet. Start a deployment to see logs here.</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Monitoring Endpoints */}
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
                              <Badge 
                                className={mockProgress.healthChecksPassed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                              >
                                {mockProgress.healthChecksPassed ? "Healthy" : "Unknown"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}