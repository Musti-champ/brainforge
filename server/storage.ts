import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "./db";
import { users, challenges, userProgress, userAchievements, skills, challengeSkills } from "@shared/schema";
import type {
  InsertUser,
  InsertChallenge,
  InsertUserProgress,
  User,
  Challenge,
  UserProgress
} from "@shared/schema";

export class ProductionStorage {
  // User operations
  async getUser(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user || null;
  }


  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      id: userData.id || `user-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | null> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  // Challenge operations
  async getChallenges(filters?: { difficulty?: string; category?: string }): Promise<Challenge[]> {
    let query = db.select().from(challenges);

    if (filters?.difficulty || filters?.category) {
      const conditions = [];
      if (filters.difficulty) conditions.push(eq(challenges.difficulty, filters.difficulty));
      if (filters.category) conditions.push(eq(challenges.category, filters.category));
      query = query.where(and(...conditions));
    }

    return await query.orderBy(asc(challenges.order));
  }

  async getChallenge(id: string): Promise<Challenge | null> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
    return challenge || null;
  }

  async createChallenge(challengeData: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db.insert(challenges).values({
      ...challengeData,
      id: challengeData.id || `challenge-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return challenge;
  }

  // Progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.updatedAt));
  }

  async getChallengeProgress(userId: string, challengeId: string): Promise<UserProgress | null> {
    const [progress] = await db.select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.challengeId, challengeId)
      ))
      .limit(1);
    return progress || null;
  }

  async createProgress(progressData: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db.insert(userProgress).values({
      ...progressData,
      id: progressData.id || `progress-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return progress;
  }

  async updateProgress(id: string, updates: Partial<InsertUserProgress>): Promise<UserProgress | null> {
    const [progress] = await db.update(userProgress)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProgress.id, id))
      .returning();
    return progress || null;
  }

  // Achievement operations (stubbed for now, assuming schema exists)
  async getUserAchievements(userId: string): Promise<any[]> {
     // Placeholder: Replace with actual DB query for achievements
    return await db.select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
  }

  async createAchievement(achievementData: any): Promise<any> {
     // Placeholder: Replace with actual DB insert for achievements
    const [achievement] = await db.insert(userAchievements).values({
      ...achievementData,
      id: achievementData.id || `achievement-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return achievement;
  }


  // Leaderboard operations
  async getLeaderboard(limit: number = 50): Promise<User[]> {
    return await db.select()
      .from(users)
      .orderBy(desc(users.totalXp), desc(users.level))
      .limit(limit);
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<{
    totalChallenges: number;
    completedChallenges: number;
    currentStreak: number;
    averageScore: number;
  }> {
    const progressData = await this.getUserProgress(userId);
    const completed = progressData.filter(p => p.isCompleted);

    return {
      totalChallenges: progressData.length,
      completedChallenges: completed.length,
      currentStreak: 0, // Calculate based on recent activity
      averageScore: completed.reduce((sum, p) => sum + (p.score || 0), 0) / (completed.length || 1)
    };
  }

  // Professional deployment tracking
  async createDeployment(data: {
    userId: string;
    challengeId: string;
    deploymentUrl: string;
    status: string;
    config: any;
  }) {
    // Store deployment information for professional tracking
    // This assumes `userProgress` can store metadata about deployments.
    // A dedicated `deployments` table might be more appropriate in a real system.
    return await db.insert(userProgress).values({
      id: `deployment-${Date.now()}`,
      userId: data.userId,
      challengeId: data.challengeId,
      isCompleted: data.status === 'success',
      completedAt: data.status === 'success' ? new Date() : null,
      score: data.status === 'success' ? 100 : 0,
      metadata: {
        deploymentUrl: data.deploymentUrl,
        deploymentConfig: data.config,
        deploymentStatus: data.status
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
  }
}

export const storage = new ProductionStorage();