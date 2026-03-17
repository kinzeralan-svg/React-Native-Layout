import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, walletsTable, activityTable, notificationSettingsTable
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { hashPassword } from "../lib/auth.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    firstName: user.firstName,
    email: user.email,
    emailVerified: user.emailVerified,
    walletSetupDone: user.walletSetupDone,
    plan: user.plan,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  });
});

router.put("/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { firstName, email, password } = req.body;
  const updates: any = {};
  if (firstName) updates.firstName = firstName;
  if (email) updates.email = email;
  if (password) updates.passwordHash = hashPassword(password);

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, user.id)).returning();
  res.json({
    id: updated.id,
    firstName: updated.firstName,
    email: updated.email,
    emailVerified: updated.emailVerified,
    walletSetupDone: updated.walletSetupDone,
    plan: updated.plan,
    avatarUrl: updated.avatarUrl,
    createdAt: updated.createdAt,
  });
});

router.post("/setup-wallet", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { lockAmount, period, goals } = req.body;

    const [existingWallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id)).limit(1);
    if (existingWallet) {
      await db.update(walletsTable).set({
        lockAmount: lockAmount.toString(),
        unlockPeriod: period,
        goals,
        lockedFunds: lockAmount.toString(),
        availableBalance: "0",
      }).where(eq(walletsTable.userId, user.id));
    } else {
      await db.insert(walletsTable).values({
        userId: user.id,
        lockAmount: lockAmount.toString(),
        unlockPeriod: period,
        goals,
        lockedFunds: lockAmount.toString(),
        availableBalance: "0",
        unlockedFunds: "0",
        bonusPoints: 0,
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const [existingActivity] = await db.select().from(activityTable).where(eq(activityTable.userId, user.id)).limit(1);
    if (!existingActivity) {
      await db.insert(activityTable).values({
        userId: user.id,
        date: today,
        steps: 0,
        stepsGoal: 10000,
        minutes: 0,
        minutesGoal: 30,
        calories: 0,
        caloriesGoal: 500,
        streakDays: 0,
      });
    }

    const [updatedUser] = await db.update(usersTable)
      .set({ walletSetupDone: true })
      .where(eq(usersTable.id, user.id))
      .returning();

    res.json({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
      walletSetupDone: updatedUser.walletSetupDone,
      plan: updatedUser.plan,
      avatarUrl: updatedUser.avatarUrl,
      createdAt: updatedUser.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/notifications", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const [settings] = await db.select().from(notificationSettingsTable).where(eq(notificationSettingsTable.userId, user.id)).limit(1);
  if (!settings) {
    res.json({ activityReminders: true, fundsUnlocked: false, streakUpdates: true });
    return;
  }
  res.json({
    activityReminders: settings.activityReminders,
    fundsUnlocked: settings.fundsUnlocked,
    streakUpdates: settings.streakUpdates,
  });
});

router.put("/notifications", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { activityReminders, fundsUnlocked, streakUpdates } = req.body;

  const [existing] = await db.select().from(notificationSettingsTable).where(eq(notificationSettingsTable.userId, user.id)).limit(1);
  if (existing) {
    await db.update(notificationSettingsTable).set({ activityReminders, fundsUnlocked, streakUpdates }).where(eq(notificationSettingsTable.userId, user.id));
  } else {
    await db.insert(notificationSettingsTable).values({ userId: user.id, activityReminders, fundsUnlocked, streakUpdates });
  }
  res.json({ activityReminders, fundsUnlocked, streakUpdates });
});

router.delete("/delete", requireAuth, async (req, res) => {
  const user = (req as any).user;
  await db.delete(notificationSettingsTable).where(eq(notificationSettingsTable.userId, user.id));
  await db.delete(activityTable).where(eq(activityTable.userId, user.id));
  await db.delete(walletsTable).where(eq(walletsTable.userId, user.id));
  await db.delete(usersTable).where(eq(usersTable.id, user.id));
  res.json({ message: "Account deleted" });
});

export default router;
