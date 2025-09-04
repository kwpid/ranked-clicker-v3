import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // "feature" or "regular"
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertNewsSchema = createInsertSchema(news).pick({
  title: true,
  content: true,
  type: true,
  isPublished: true,
});

// Tournament tables
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  season: integer("season").notNull(),
  stage: text("stage").notNull(), // "qualifiers", "regionals", "majors", "worlds"
  stageNumber: integer("stage_number").default(1), // For multiple regionals/majors
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").default("upcoming").notNull(), // "upcoming", "active", "completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tournamentTeams = pgTable("tournament_teams", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  playerUsername: text("player_username").notNull(), // Player leading the team
  playerMMR: integer("player_mmr").notNull(),
  teammate1Name: text("teammate1_name").notNull(),
  teammate1MMR: integer("teammate1_mmr").notNull(),
  teammate2Name: text("teammate2_name").notNull(),
  teammate2MMR: integer("teammate2_mmr").notNull(),
  averageMMR: integer("average_mmr").notNull(),
  placement: integer("placement"), // Final placement in tournament
  eliminated: boolean("eliminated").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tournamentMatches = pgTable("tournament_matches", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  team1Id: integer("team1_id").references(() => tournamentTeams.id).notNull(),
  team2Id: integer("team2_id").references(() => tournamentTeams.id).notNull(),
  winnerId: integer("winner_id").references(() => tournamentTeams.id),
  round: text("round").notNull(), // "qualifiers", "round-of-32", "round-of-16", etc.
  bestOf: integer("best_of").default(5).notNull(),
  team1Score: integer("team1_score").default(0).notNull(),
  team2Score: integer("team2_score").default(0).notNull(),
  status: text("status").default("pending").notNull(), // "pending", "in-progress", "completed"
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tournamentRewards = pgTable("tournament_rewards", {
  id: serial("id").primaryKey(),
  playerUsername: text("player_username").notNull(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  placement: integer("placement").notNull(),
  titleEarned: text("title_earned").notNull(),
  titleColor: text("title_color").notNull(),
  hasGlow: boolean("has_glow").default(false).notNull(),
  awarded: boolean("awarded").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema validation for inserts
export const insertTournamentSchema = createInsertSchema(tournaments).pick({
  season: true,
  stage: true,
  stageNumber: true,
  startDate: true,
  endDate: true,
  status: true,
});

export const insertTournamentTeamSchema = createInsertSchema(tournamentTeams).pick({
  tournamentId: true,
  playerUsername: true,
  playerMMR: true,
  teammate1Name: true,
  teammate1MMR: true,
  teammate2Name: true,
  teammate2MMR: true,
  averageMMR: true,
});

export const insertTournamentMatchSchema = createInsertSchema(tournamentMatches).pick({
  tournamentId: true,
  team1Id: true,
  team2Id: true,
  round: true,
  bestOf: true,
  scheduledAt: true,
});

export const insertTournamentRewardSchema = createInsertSchema(tournamentRewards).pick({
  playerUsername: true,
  tournamentId: true,
  placement: true,
  titleEarned: true,
  titleColor: true,
  hasGlow: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type TournamentTeam = typeof tournamentTeams.$inferSelect;
export type InsertTournamentTeam = z.infer<typeof insertTournamentTeamSchema>;
export type TournamentMatch = typeof tournamentMatches.$inferSelect;
export type InsertTournamentMatch = z.infer<typeof insertTournamentMatchSchema>;
export type TournamentReward = typeof tournamentRewards.$inferSelect;
export type InsertTournamentReward = z.infer<typeof insertTournamentRewardSchema>;
