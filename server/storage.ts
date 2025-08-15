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
        skillsLearned: ["HTTP GET requests", "JSON parsing", "Basic error handling"],
        apiProvider: "Quotable API",
        prerequisites: [],
        tags: ["beginner-friendly", "quotes", "json"]
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
        skillsLearned: ["API authentication", "Error handling", "Data transformation", "Nested object parsing"],
        apiProvider: "OpenWeather API",
        prerequisites: ["challenge-1"],
        tags: ["weather", "api-keys", "error-handling"]
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
        skillsLearned: ["OAuth 2.0 flow", "Token management", "Secure authentication", "GitHub API integration"],
        apiProvider: "GitHub API",
        prerequisites: ["challenge-2"],
        tags: ["oauth", "authentication", "security", "github"]
      },
      {
        id: "challenge-4",
        title: "GraphQL Query Builder",
        description: "Master GraphQL syntax by building complex queries with variables and fragments.",
        difficulty: "intermediate",
        category: "GraphQL",
        xpReward: 350,
        estimatedTime: 45,
        apiEndpoint: "https://rickandmortyapi.com/graphql",
        sampleCode: `const query = \`
  query GetCharacters($page: Int, $filter: FilterCharacter) {
    characters(page: $page, filter: $filter) {
      info {
        count
        pages
      }
      results {
        id
        name
        status
        species
        location {
          name
        }
      }
    }
  }
\`;

fetch('https://rickandmortyapi.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables: {
      page: 1,
      filter: { status: "alive" }
    }
  })
});`,
        expectedResponse: { data: { characters: { results: [] } } },
        hints: ["GraphQL uses POST method with query in body", "Variables allow dynamic queries", "Use fragments to reuse query parts"],
        postmanCollectionUrl: "https://postman.com/collections/rickandmorty-graphql",
        requirements: ["Write GraphQL queries", "Use variables and filters", "Handle nested data structures"],
        completedCount: 890,
        isActive: true,
        skillsLearned: ["GraphQL syntax", "Query variables", "Fragment usage", "API introspection"],
        apiProvider: "Rick and Morty API",
        prerequisites: ["challenge-1"],
        tags: ["graphql", "queries", "variables", "fragments"]
      },
      {
        id: "challenge-5",
        title: "Rate Limiting & Pagination",
        description: "Handle API rate limits gracefully and implement efficient pagination strategies.",
        difficulty: "advanced",
        category: "REST",
        xpReward: 400,
        estimatedTime: 50,
        apiEndpoint: "https://jsonplaceholder.typicode.com/posts",
        sampleCode: `class APIClient {
  constructor() {
    this.rateLimitRemaining = 100;
    this.rateLimitReset = Date.now() + 3600000;
  }

  async makeRequest(url, options = {}) {
    // Check rate limit
    if (this.rateLimitRemaining <= 0 && Date.now() < this.rateLimitReset) {
      const waitTime = this.rateLimitReset - Date.now();
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const response = await fetch(url, options);
    
    // Update rate limit from headers
    this.rateLimitRemaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '100');
    this.rateLimitReset = parseInt(response.headers.get('X-RateLimit-Reset') || Date.now() + 3600000);
    
    return response;
  }

  async getAllPosts() {
    let allPosts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.makeRequest(\`https://jsonplaceholder.typicode.com/posts?_page=\${page}&_limit=10\`);
      const posts = await response.json();
      
      if (posts.length === 0) {
        hasMore = false;
      } else {
        allPosts = allPosts.concat(posts);
        page++;
      }
    }

    return allPosts;
  }
}`,
        expectedResponse: { posts: [], pagination: { page: 1, total: 100 } },
        hints: ["Monitor rate limit headers in responses", "Implement exponential backoff for retries", "Use cursor-based pagination when available"],
        postmanCollectionUrl: "https://postman.com/collections/pagination-rate-limiting",
        requirements: ["Implement rate limiting logic", "Handle pagination efficiently", "Parse response headers"],
        completedCount: 324,
        isActive: true,
        skillsLearned: ["Rate limiting", "Pagination strategies", "Header parsing", "Async operations"],
        apiProvider: "JSONPlaceholder",
        prerequisites: ["challenge-2"],
        tags: ["rate-limiting", "pagination", "performance", "headers"]
      }
    ];

    sampleChallenges.forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });

    // Add some sample progress for the user
    const sampleProgress = [
      {
        id: "progress-1",
        userId: "user-1",
        challengeId: "challenge-1",
        isCompleted: true,
        currentStep: 4,
        solution: "fetch('https://api.quotable.io/random').then(r => r.json()).then(d => console.log(d))",
        completedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
        attempts: 1
      },
      {
        id: "progress-2",
        userId: "user-1",
        challengeId: "challenge-2",
        isCompleted: false,
        currentStep: 3,
        solution: null,
        completedAt: null,
        attempts: 2
      }
    ];

    sampleProgress.forEach(progress => {
      this.userProgress.set(progress.id, progress);
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
