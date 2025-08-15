import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  completedChallenges: integer("completed_challenges").notNull().default(0),
  badges: jsonb("badges").$type<string[]>().notNull().default([]),
  rank: integer("rank").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  category: text("category").notNull(), // REST, GraphQL, Authentication, etc.
  xpReward: integer("xp_reward").notNull(),
  estimatedTime: integer("estimated_time").notNull(), // in minutes
  apiEndpoint: text("api_endpoint"),
  sampleCode: text("sample_code"),
  expectedResponse: jsonb("expected_response"),
  hints: jsonb("hints").$type<string[]>().notNull().default([]),
  postmanCollectionUrl: text("postman_collection_url"),
  requirements: jsonb("requirements").$type<string[]>().notNull().default([]),
  completedCount: integer("completed_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  skillsLearned: jsonb("skills_learned").$type<string[]>().notNull().default([]),
  apiProvider: text("api_provider"), // GitHub, OpenWeather, etc.
  prerequisites: jsonb("prerequisites").$type<string[]>().notNull().default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  isCompleted: boolean("is_completed").notNull().default(false),
  currentStep: integer("current_step").notNull().default(1),
  solution: text("solution"),
  completedAt: timestamp("completed_at"),
  attempts: integer("attempts").notNull().default(0),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Real-time collaboration tables
export const collaborationSessions = pgTable("collaboration_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  hostUserId: varchar("host_user_id").notNull().references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  maxParticipants: integer("max_participants").notNull().default(2),
  createdAt: timestamp("created_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const sessionParticipants = pgTable("session_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => collaborationSessions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  isActive: boolean("is_active").notNull().default(true),
});

// Community features
export const userGeneratedChallenges = pgTable("user_generated_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  category: text("category").notNull(),
  apiEndpoint: text("api_endpoint"),
  sampleCode: text("sample_code"),
  expectedResponse: jsonb("expected_response"),
  isApproved: boolean("is_approved").notNull().default(false),
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeReviews = pgTable("challenge_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => userGeneratedChallenges.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").references(() => challenges.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  postType: text("post_type").notNull().default("discussion"), // discussion, question, solution
  upvotes: integer("upvotes").notNull().default(0),
  isResolved: boolean("is_resolved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => forumPosts.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  isAcceptedAnswer: boolean("is_accepted_answer").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Professional development
export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  skillTrack: text("skill_track").notNull(), // REST, GraphQL, Authentication, etc.
  issuedAt: timestamp("issued_at").defaultNow(),
  verificationCode: text("verification_code").notNull(),
  challengesCompleted: jsonb("challenges_completed").$type<string[]>().notNull(),
});

export const userPortfolios = pgTable("user_portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  isPublic: boolean("is_public").notNull().default(true),
  bio: text("bio"),
  githubUsername: text("github_username"),
  linkedinUrl: text("linkedin_url"),
  websiteUrl: text("website_url"),
  featuredChallenges: jsonb("featured_challenges").$type<string[]>().notNull().default([]),
  skillHighlights: jsonb("skill_highlights").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mentorship system
export const mentorshipRequests = pgTable("mentorship_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menteeId: varchar("mentee_id").notNull().references(() => users.id),
  mentorId: varchar("mentor_id").references(() => users.id),
  skillArea: text("skill_area").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// DevOps challenges
export const deploymentChallenges = pgTable("deployment_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  category: text("category").notNull().default("devops"),
  dockerfileTemplate: text("dockerfile_template"),
  cicdConfig: text("cicd_config"),
  deploymentUrl: text("deployment_url"),
  monitoringEndpoints: jsonb("monitoring_endpoints").$type<string[]>().notNull().default([]),
  xpReward: integer("xp_reward").notNull(),
  estimatedTime: integer("estimated_time").notNull(),
  completedCount: integer("completed_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertCollaborationSessionSchema = createInsertSchema(collaborationSessions).omit({
  id: true,
  createdAt: true,
});

export const insertUserGeneratedChallengeSchema = createInsertSchema(userGeneratedChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedAt: true,
});

export const insertUserPortfolioSchema = createInsertSchema(userPortfolios).omit({
  id: true,
  updatedAt: true,
});

export const insertMentorshipRequestSchema = createInsertSchema(mentorshipRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeploymentChallengeSchema = createInsertSchema(deploymentChallenges).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type CollaborationSession = typeof collaborationSessions.$inferSelect;
export type InsertCollaborationSession = z.infer<typeof insertCollaborationSessionSchema>;
export type SessionParticipant = typeof sessionParticipants.$inferSelect;
export type UserGeneratedChallenge = typeof userGeneratedChallenges.$inferSelect;
export type InsertUserGeneratedChallenge = z.infer<typeof insertUserGeneratedChallengeSchema>;
export type ChallengeReview = typeof challengeReviews.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumReply = typeof forumReplies.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type UserPortfolio = typeof userPortfolios.$inferSelect;
export type InsertUserPortfolio = z.infer<typeof insertUserPortfolioSchema>;
export type MentorshipRequest = typeof mentorshipRequests.$inferSelect;
export type InsertMentorshipRequest = z.infer<typeof insertMentorshipRequestSchema>;
export type DeploymentChallenge = typeof deploymentChallenges.$inferSelect;
export type InsertDeploymentChallenge = z.infer<typeof insertDeploymentChallengeSchema>;
