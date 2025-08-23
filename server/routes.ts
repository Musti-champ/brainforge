import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertChallengeSchema, insertUserProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Challenge routes
  app.get("/api/challenges", async (req, res) => {
    try {
      const { difficulty, category } = req.query;
      const challenges = await storage.getChallenges({
        difficulty: difficulty as string,
        category: category as string,
      });
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/challenges/:id", async (req, res) => {
    try {
      const challenge = await storage.getChallenge(req.params.id);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Progress routes
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.params.userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.createProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  app.patch("/api/progress/:id", async (req, res) => {
    try {
      const progress = await storage.updateProgress(req.params.id, req.body);
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Production DevOps challenges routes
  app.get("/api/deployment-challenges", async (req, res) => {
    try {
      const challenges = await storage.getChallenges({ category: "devops" });
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/deployment-progress/:challengeId", async (req, res) => {
    try {
      // Mock deployment progress
      const progress = {
        challengeId: req.params.challengeId,
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
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/deployment-challenges/deploy", async (req, res) => {
    try {
      const { userId, challengeId, dockerfile, cicdConfig } = req.body;
      
      // Generate unique deployment URL
      const deploymentId = `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const deploymentUrl = `https://${deploymentId}.replit.app`;
      
      // Store deployment record
      const deployment = await storage.createDeployment({
        userId,
        challengeId,
        deploymentUrl,
        status: "success",
        config: { dockerfile, cicdConfig }
      });
      
      // Update user XP
      const challenge = await storage.getChallenge(challengeId);
      if (challenge) {
        const user = await storage.getUser(userId);
        if (user) {
          await storage.updateUser(userId, {
            totalXp: user.totalXp + challenge.xpReward,
            level: Math.floor((user.totalXp + challenge.xpReward) / 1000) + 1
          });
        }
      }
      
      res.json({
        deploymentUrl,
        status: "success",
        message: "Deployment completed successfully",
        deploymentId: deployment[0].id
      });
    } catch (error) {
      res.status(500).json({ message: "Deployment failed" });
    }
  });

  app.post("/api/deployment-challenges/:challengeId/health-check", async (req, res) => {
    try {
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({
        passedChecks: 4,
        totalChecks: 4,
        allPassed: true,
        checks: [
          { name: "Health endpoint", status: "passed" },
          { name: "Metrics endpoint", status: "passed" },
          { name: "Ready endpoint", status: "passed" },
          { name: "API status", status: "passed" }
        ]
      });
    } catch (error) {
      res.status(500).json({ message: "Health check failed" });
    }
  });

  // API proxy routes for testing
  app.get("/api/proxy/quotes", async (req, res) => {
    try {
      const response = await fetch("https://api.quotable.io/random");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote" });
    }
  });

  app.get("/api/proxy/weather", async (req, res) => {
    try {
      const { q, appid } = req.query;
      const apiKey = process.env.OPENWEATHER_API_KEY || appid;
      
      if (!apiKey) {
        return res.status(400).json({ message: "API key required" });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Test API endpoint
  app.post("/api/test-request", async (req, res) => {
    try {
      const { method, url, headers, body } = req.body;
      
      const fetchOptions: RequestInit = {
        method: method || "GET",
        headers: headers || {},
      };
      
      if (body && method !== "GET") {
        fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);
      const data = await response.json();
      
      res.json({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Request failed", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/user/:userId", async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.params.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Leaderboard endpoint
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Professional portfolio endpoint
  app.get("/api/portfolio/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      const progress = await storage.getUserProgress(req.params.userId);
      const stats = await storage.getUserStats(req.params.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        user,
        stats,
        completedChallenges: progress.filter(p => p.isCompleted),
        recentActivity: progress.slice(0, 10)
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
