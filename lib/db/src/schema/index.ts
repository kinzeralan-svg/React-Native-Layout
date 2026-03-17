import { pgTable, serial, text, boolean, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const planEnum = pgEnum("plan", ["free", "premium"]);
export const unlockPeriodEnum = pgEnum("unlock_period", ["daily", "weekly", "monthly"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["unlock", "bonus", "withdrawal"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationCode: text("email_verification_code"),
  walletSetupDone: boolean("wallet_setup_done").notNull().default(false),
  plan: planEnum("plan").notNull().default("free"),
  avatarUrl: text("avatar_url"),
  sessionToken: text("session_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  availableBalance: numeric("available_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  lockedFunds: numeric("locked_funds", { precision: 10, scale: 2 }).notNull().default("0"),
  unlockedFunds: numeric("unlocked_funds", { precision: 10, scale: 2 }).notNull().default("0"),
  bonusPoints: integer("bonus_points").notNull().default(0),
  unlockPeriod: unlockPeriodEnum("unlock_period").notNull().default("daily"),
  lockAmount: numeric("lock_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  goals: text("goals").array().notNull().default([]),
  recentUnlock: text("recent_unlock"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => walletsTable.id),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityTable = pgTable("activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  date: text("date").notNull(),
  steps: integer("steps").notNull().default(0),
  stepsGoal: integer("steps_goal").notNull().default(10000),
  minutes: integer("minutes").notNull().default(0),
  minutesGoal: integer("minutes_goal").notNull().default(30),
  calories: integer("calories").notNull().default(0),
  caloriesGoal: integer("calories_goal").notNull().default(500),
  streakDays: integer("streak_days").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challengesTable = pgTable("challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  challengeId: text("challenge_id").notNull(),
  joined: boolean("joined").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationSettingsTable = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  activityReminders: boolean("activity_reminders").notNull().default(true),
  fundsUnlocked: boolean("funds_unlocked").notNull().default(false),
  streakUpdates: boolean("streak_updates").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export const insertWalletSchema = createInsertSchema(walletsTable).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activityTable).omit({ id: true, createdAt: true });

export type User = typeof usersTable.$inferSelect;
export type Wallet = typeof walletsTable.$inferSelect;
export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;
export type Activity = typeof activityTable.$inferSelect;
export type NotificationSettings = typeof notificationSettingsTable.$inferSelect;
