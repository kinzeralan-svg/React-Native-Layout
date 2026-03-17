import { Router } from "express";
import { db } from "@workspace/db";
import { challengesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

const STATIC_CHALLENGES = [
  {
    id: "daily-steps",
    title: "Walk 10,000 steps",
    description: "Daily Goal",
    bonusPoints: 5,
  },
  {
    id: "weekly-workouts",
    title: "Complete 5 workouts",
    description: "Weekly Challenge",
    bonusPoints: 15,
  },
];

const STATIC_BADGES = [
  { id: "streak-3", title: "3-Day Streak", daysCount: 3, type: "streak" },
  { id: "streak-7", title: "7-Day Streak", daysCount: 7, type: "streak" },
  { id: "challenge-30", title: "30 Day Challenge", daysCount: 30, type: "challenge" },
];

const STATIC_DISCOUNTS = [
  { id: "nike", brand: "Nike", description: "10% off after completing 50,000 steps", logoIcon: "nike" },
  { id: "adidas", brand: "Adidas", description: "Free gym month after completing 10 workouts", logoIcon: "adidas" },
  { id: "gymshark", brand: "GymShark", description: "Cashback on purchases for active users", logoIcon: "gymshark" },
];

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const userChallenges = await db.select().from(challengesTable).where(eq(challengesTable.userId, user.id));
    const joinedIds = userChallenges.filter(c => c.joined).map(c => c.challengeId);

    res.json({
      dailyGoal: {
        ...STATIC_CHALLENGES[0],
        joined: joinedIds.includes("daily-steps"),
      },
      weeklyChallenge: {
        ...STATIC_CHALLENGES[1],
        joined: joinedIds.includes("weekly-workouts"),
      },
      badges: STATIC_BADGES,
      partnerDiscounts: STATIC_DISCOUNTS,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/join-challenge", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { challengeId } = req.body;

    const [existing] = await db.select().from(challengesTable)
      .where(and(eq(challengesTable.userId, user.id), eq(challengesTable.challengeId, challengeId)))
      .limit(1);

    if (existing) {
      await db.update(challengesTable).set({ joined: true }).where(eq(challengesTable.id, existing.id));
    } else {
      await db.insert(challengesTable).values({
        userId: user.id,
        challengeId,
        joined: true,
      });
    }

    res.json({ message: "Challenge joined successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
