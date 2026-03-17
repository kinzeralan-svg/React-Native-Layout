import { Router } from "express";
import { db } from "@workspace/db";
import { walletsTable, walletTransactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id)).limit(1);

    if (!wallet) {
      res.json({
        availableBalance: 0,
        lockedFunds: 0,
        unlockedFunds: 0,
        bonusPoints: 0,
        unlockPeriod: "daily",
        history: [],
        recentUnlock: null,
      });
      return;
    }

    const transactions = await db.select().from(walletTransactionsTable)
      .where(eq(walletTransactionsTable.walletId, wallet.id))
      .orderBy(walletTransactionsTable.createdAt)
      .limit(10);

    res.json({
      availableBalance: parseFloat(wallet.availableBalance),
      lockedFunds: parseFloat(wallet.lockedFunds),
      unlockedFunds: parseFloat(wallet.unlockedFunds),
      bonusPoints: wallet.bonusPoints,
      unlockPeriod: wallet.unlockPeriod,
      recentUnlock: wallet.recentUnlock,
      history: transactions.map(t => ({
        id: t.id,
        description: t.description,
        amount: parseFloat(t.amount),
        type: t.type,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/withdraw", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { amount } = req.body;
    const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id)).limit(1);

    if (!wallet) {
      res.status(400).json({ error: "Wallet not found" });
      return;
    }

    const available = parseFloat(wallet.availableBalance);
    if (amount > available) {
      res.status(400).json({ error: "Insufficient funds" });
      return;
    }

    const newBalance = (available - amount).toFixed(2);
    await db.update(walletsTable).set({ availableBalance: newBalance }).where(eq(walletsTable.id, wallet.id));

    await db.insert(walletTransactionsTable).values({
      walletId: wallet.id,
      description: `£${amount} withdrawn`,
      amount: (-amount).toString(),
      type: "withdrawal",
    });

    const transactions = await db.select().from(walletTransactionsTable)
      .where(eq(walletTransactionsTable.walletId, wallet.id))
      .orderBy(walletTransactionsTable.createdAt)
      .limit(10);

    res.json({
      availableBalance: parseFloat(newBalance),
      lockedFunds: parseFloat(wallet.lockedFunds),
      unlockedFunds: parseFloat(wallet.unlockedFunds),
      bonusPoints: wallet.bonusPoints,
      unlockPeriod: wallet.unlockPeriod,
      recentUnlock: wallet.recentUnlock,
      history: transactions.map(t => ({
        id: t.id,
        description: t.description,
        amount: parseFloat(t.amount),
        type: t.type,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
