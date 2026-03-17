import { Router } from "express";
import { db } from "@workspace/db";
import { activityTable, walletsTable, walletTransactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

function generateCalendarData(steps: number, stepsGoal: number) {
  const today = new Date();
  const calendar = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const isToday = i === 0;
    const completed = !isToday && Math.random() > 0.4;
    calendar.push({
      date: dateStr,
      completed,
      amount: completed ? Math.floor(Math.random() * 20) + 5 : null,
    });
  }
  return calendar;
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const period = (req.query.period as string) || "daily";

    const [activity] = await db.select().from(activityTable)
      .where(eq(activityTable.userId, user.id))
      .orderBy(activityTable.createdAt)
      .limit(1);

    if (!activity) {
      res.json({
        steps: 0, stepsGoal: 10000,
        minutes: 0, minutesGoal: 30,
        calories: 0, caloriesGoal: 500,
        streakDays: 0,
        period,
        calendarData: generateCalendarData(0, 10000),
        progressAmount: 0,
        progressGoal: 500,
      });
      return;
    }

    let progressAmount = 0;
    let progressGoal = 500;
    if (period === "weekly") {
      progressAmount = activity.steps * 7 * 0.05;
      progressGoal = 500;
    } else if (period === "monthly") {
      progressAmount = activity.steps * 30 * 0.05;
      progressGoal = 500;
    } else {
      progressAmount = activity.steps * 0.01;
      progressGoal = 50;
    }

    res.json({
      steps: activity.steps,
      stepsGoal: activity.stepsGoal,
      minutes: activity.minutes,
      minutesGoal: activity.minutesGoal,
      calories: activity.calories,
      caloriesGoal: activity.caloriesGoal,
      streakDays: activity.streakDays,
      period,
      calendarData: generateCalendarData(activity.steps, activity.stepsGoal),
      progressAmount: Math.min(progressAmount, progressGoal),
      progressGoal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/log", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { type, value } = req.body;

    let [activity] = await db.select().from(activityTable).where(eq(activityTable.userId, user.id)).limit(1);
    if (!activity) {
      const today = new Date().toISOString().split("T")[0];
      [activity] = await db.insert(activityTable).values({
        userId: user.id,
        date: today,
        steps: 0,
        stepsGoal: 10000,
        minutes: 0,
        minutesGoal: 30,
        calories: 0,
        caloriesGoal: 500,
        streakDays: 0,
      }).returning();
    }

    let updates: any = {};
    let unlockAmount = 0;
    let description = "";
    let bonus = 0;

    if (type === "steps") {
      const newSteps = activity.steps + value;
      updates.steps = newSteps;
      if (newSteps >= activity.stepsGoal) {
        unlockAmount = 10;
        description = `${(newSteps / 1000).toFixed(0)}k steps → £${unlockAmount} unlocked`;
        bonus = 5;
      }
      if (activity.streakDays < 3) updates.streakDays = activity.streakDays + 1;
    } else if (type === "workout") {
      updates.minutes = activity.minutes + value;
      if (updates.minutes >= activity.minutesGoal) {
        unlockAmount = 5;
        description = `${value} min workout → £${unlockAmount} unlocked`;
        bonus = 3;
      }
    } else if (type === "calories") {
      updates.calories = activity.calories + value;
    }

    const [updated] = await db.update(activityTable).set(updates).where(eq(activityTable.id, activity.id)).returning();

    if (unlockAmount > 0) {
      const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id)).limit(1);
      if (wallet) {
        const newLocked = Math.max(0, parseFloat(wallet.lockedFunds) - unlockAmount);
        const newUnlocked = parseFloat(wallet.unlockedFunds) + unlockAmount;
        const newAvailable = parseFloat(wallet.availableBalance) + unlockAmount;
        await db.update(walletsTable).set({
          lockedFunds: newLocked.toFixed(2),
          unlockedFunds: newUnlocked.toFixed(2),
          availableBalance: newAvailable.toFixed(2),
          bonusPoints: wallet.bonusPoints + bonus,
          recentUnlock: `£${unlockAmount} Unlocked Today!`,
        }).where(eq(walletsTable.id, wallet.id));

        await db.insert(walletTransactionsTable).values({
          walletId: wallet.id,
          description,
          amount: unlockAmount.toString(),
          type: "unlock",
        });
      }
    }

    res.json({
      steps: updated.steps,
      stepsGoal: updated.stepsGoal,
      minutes: updated.minutes,
      minutesGoal: updated.minutesGoal,
      calories: updated.calories,
      caloriesGoal: updated.caloriesGoal,
      streakDays: updated.streakDays,
      period: "daily",
      calendarData: generateCalendarData(updated.steps, updated.stepsGoal),
      progressAmount: Math.min(updated.steps * 0.01, 50),
      progressGoal: 50,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
