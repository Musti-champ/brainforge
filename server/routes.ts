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

  // Real-time collaboration endpoints
  app.get("/api/collaboration/sessions", async (req, res) => {
    try {
      // Mock active sessions for now
      const sessions = [
        {
          id: "session-1",
          challengeId: "challenge-1",
          challengeTitle: "REST API Basics",
          hostUserId: "user-2",
          hostUsername: "api_master",
          isActive: true,
          maxParticipants: 3,
          currentParticipants: 2,
          createdAt: new Date().toISOString(),
          sessionCode: "ABC123",
          difficulty: "beginner",
          category: "REST"
        }
      ];
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.post("/api/collaboration/sessions", async (req, res) => {
    try {
      const { challengeId, maxParticipants } = req.body;
      const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const session = {
        id: `session-${Date.now()}`,
        challengeId,
        challengeTitle: "Mock Challenge",
        hostUserId: "current-user",
        hostUsername: "current_user",
        isActive: true,
        maxParticipants,
        currentParticipants: 1,
        createdAt: new Date().toISOString(),
        sessionCode,
        difficulty: "intermediate",
        category: "REST"
      };
      
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.post("/api/collaboration/sessions/join", async (req, res) => {
    try {
      const { sessionCode } = req.body;
      
      // Mock session join
      const session = {
        id: `session-${sessionCode}`,
        challengeId: "challenge-1",
        challengeTitle: "Joined Challenge",
        hostUserId: "host-user",
        hostUsername: "host_user",
        isActive: true,
        maxParticipants: 3,
        currentParticipants: 2,
        createdAt: new Date().toISOString(),
        sessionCode,
        difficulty: "intermediate",
        category: "REST"
      };
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to join session" });
    }
  });

  // AI Code Review endpoints
  app.post("/api/ai/code-review", async (req, res) => {
    try {
      const { code, language, reviewType } = req.body;
      
      // Mock AI review response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const review = {
        id: `review-${Date.now()}`,
        overallScore: Math.floor(Math.random() * 30) + 70,
        issues: [
          {
            id: "issue-1",
            type: "warning",
            severity: "medium",
            title: "Missing Error Handling",
            description: "The code lacks proper error handling mechanisms.",
            line: 5,
            column: 3,
            category: "Error Handling"
          }
        ],
        strengths: ["Good variable naming", "Consistent formatting"],
        recommendations: ["Add error handling", "Include unit tests"],
        language,
        reviewType,
        timestamp: new Date().toISOString()
      };
      
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "AI review failed" });
    }
  });

  // Mentorship system endpoints
  app.get("/api/mentorship/mentors", async (req, res) => {
    try {
      const mentors = [
        {
          id: "mentor-1",
          username: "api_veteran",
          bio: "Senior API architect with 8+ years experience",
          skillAreas: ["REST APIs", "GraphQL", "API Design"],
          experience: "8+ years",
          rating: 4.9,
          totalMentees: 45,
          availableSlots: 3,
          responseTime: "< 2 hours",
          isAvailable: true,
          sessionRate: 200
        }
      ];
      res.json(mentors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mentors" });
    }
  });

  app.get("/api/mentorship/requests/:userId", async (req, res) => {
    try {
      const requests = [
        {
          id: "req-1",
          menteeId: req.params.userId,
          skillArea: "REST APIs",
          message: "Need help with API design patterns",
          status: "pending",
          createdAt: new Date().toISOString()
        }
      ];
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.post("/api/mentorship/requests", async (req, res) => {
    try {
      const { mentorId, skillArea, message } = req.body;
      
      const request = {
        id: `req-${Date.now()}`,
        mentorId,
        skillArea,
        message,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to send request" });
    }
  });

  app.get("/api/mentorship/sessions/:userId", async (req, res) => {
    try {
      const sessions = [
        {
          id: "session-1",
          mentorId: "mentor-1",
          menteeId: req.params.userId,
          skillArea: "REST APIs",
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          status: "scheduled",
          goals: ["Learn API design", "Understand REST principles"]
        }
      ];
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
