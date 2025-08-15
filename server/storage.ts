import { type User, type InsertUser, type Challenge, type InsertChallenge, type UserProgress, type InsertUserProgress, type Achievement, type InsertAchievement } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Challenge operations
  getChallenges(filters?: { difficulty?: string; category?: string }): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;

  // Progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getChallengeProgress(userId: string, challengeId: string): Promise<UserProgress | undefined>;
  createProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateProgress(id: string, updates: Partial<UserProgress>): Promise<UserProgress | undefined>;

  // Achievement operations
  getUserAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private challenges: Map<string, Challenge>;
  private userProgress: Map<string, UserProgress>;
  private achievements: Map<string, Achievement>;

  constructor() {
    this.users = new Map();
    this.challenges = new Map();
    this.userProgress = new Map();
    this.achievements = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: "user-1",
      username: "developer",
      email: "dev@example.com",
      level: 5,
      xp: 1250,
      streak: 7,
      completedChallenges: 23,
      badges: ["rest-master", "auth-expert"],
      rank: 156,
      createdAt: new Date(),
    };
    this.users.set(sampleUser.id, sampleUser);

    // Create sample challenges
    const sampleChallenges: Challenge[] = [
      {
        id: "challenge-1",
        title: "Your First API Call",
        description: "Learn the basics of making GET requests and understanding API responses using a simple quotes API.",
        difficulty: "beginner",
        category: "REST",
        xpReward: 100,
        estimatedTime: 15,
        apiEndpoint: "https://api.quotable.io/random",
        sampleCode: `fetch('https://api.quotable.io/random')
  .then(response => response.json())
  .then(data => console.log(data));`,
        expectedResponse: { content: "Sample quote", author: "Author Name" },
        hints: ["Use fetch() to make HTTP requests", "Check the response status before parsing JSON"],
        postmanCollectionUrl: "https://postman.com/collections/quotes-api",
        requirements: ["Make a GET request", "Parse the JSON response", "Display quote and author"],
        completedCount: 2100,
        isActive: true,
      },
      {
        id: "challenge-2",
        title: "Weather API Integration",
        description: "Build a request to fetch current weather data with proper error handling",
        difficulty: "intermediate",
        category: "REST",
        xpReward: 250,
        estimatedTime: 30,
        apiEndpoint: "https://api.openweathermap.org/data/2.5/weather",
        sampleCode: `fetch('https://api.openweathermap.org/data/2.5/weather?q=London,UK&appid=YOUR_API_KEY')
  .then(response => {
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return response.json();
  })
  .then(data => {
    // TODO: Extract temperature, humidity, and description
    console.log(data);
  })
  .catch(error => {
    console.error('Error fetching weather data:', error);
  });`,
        expectedResponse: { main: { temp: 285.32, humidity: 72 }, weather: [{ description: "broken clouds" }] },
        hints: ["Convert temperature from Kelvin to Celsius: °C = K - 273.15", "Use dot notation to access nested data: data.main.temp"],
        postmanCollectionUrl: "https://postman.com/collections/openweather-api",
        requirements: ["Add API key authentication", "Handle HTTP errors", "Extract specific weather data"],
        completedCount: 1500,
        isActive: true,
      },
      {
        id: "challenge-3",
        title: "OAuth 2.0 Flow Mastery",
        description: "Implement complete OAuth authentication flows and handle refresh tokens in a real-world scenario.",
        difficulty: "advanced",
        category: "Authentication",
        xpReward: 500,
        estimatedTime: 60,
        apiEndpoint: "https://api.github.com/user",
        sampleCode: `// Step 1: Redirect to GitHub OAuth
const clientId = 'your_client_id';
const redirectUri = 'your_redirect_uri';
const scope = 'user:email';

const authUrl = \`https://github.com/login/oauth/authorize?client_id=\${clientId}&redirect_uri=\${redirectUri}&scope=\${scope}\`;

// Step 2: Exchange code for access token
async function exchangeCodeForToken(code) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: 'your_client_secret',
      code: code,
    }),
  });
  
  return response.json();
}`,
        expectedResponse: { login: "username", email: "user@example.com", name: "User Name" },
        hints: ["OAuth requires multiple steps: authorize, exchange code for token, use token for API calls", "Store access tokens securely", "Handle token expiration and refresh"],
        postmanCollectionUrl: "https://postman.com/collections/github-oauth",
        requirements: ["Implement OAuth authorization flow", "Exchange authorization code for access token", "Make authenticated API requests"],
        completedCount: 542,
        isActive: true,
      },
    ];

    sampleChallenges.forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getChallenges(filters?: { difficulty?: string; category?: string }): Promise<Challenge[]> {
    let challenges = Array.from(this.challenges.values()).filter(c => c.isActive);
    
    if (filters?.difficulty) {
      challenges = challenges.filter(c => c.difficulty === filters.difficulty);
    }
    
    if (filters?.category) {
      challenges = challenges.filter(c => c.category === filters.category);
    }
    
    return challenges;
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = randomUUID();
    const challenge: Challenge = { ...insertChallenge, id };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(p => p.userId === userId);
  }

  async getChallengeProgress(userId: string, challengeId: string): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(p => p.userId === userId && p.challengeId === challengeId);
  }

  async createProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = randomUUID();
    const progress: UserProgress = { ...insertProgress, id };
    this.userProgress.set(id, progress);
    return progress;
  }

  async updateProgress(id: string, updates: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const progress = this.userProgress.get(id);
    if (!progress) return undefined;
    
    const updatedProgress = { ...progress, ...updates };
    this.userProgress.set(id, updatedProgress);
    return updatedProgress;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(a => a.userId === userId);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const achievement: Achievement = { ...insertAchievement, id };
    this.achievements.set(id, achievement);
    return achievement;
  }
}

export const storage = new MemStorage();
