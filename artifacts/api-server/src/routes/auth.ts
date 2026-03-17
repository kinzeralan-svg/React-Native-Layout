import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, walletsTable, notificationSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, generateToken, generateVerificationCode } from "../lib/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { firstName, email, password } = req.body;
    if (!firstName || !email || !password) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = hashPassword(password);
    const verificationCode = generateVerificationCode();
    const token = generateToken();

    const [user] = await db.insert(usersTable).values({
      firstName,
      email,
      passwordHash,
      emailVerified: false,
      emailVerificationCode: verificationCode,
      walletSetupDone: false,
      plan: "free",
      sessionToken: token,
    }).returning();

    await db.insert(notificationSettingsTable).values({
      userId: user.id,
      activityReminders: true,
      fundsUnlocked: false,
      streakUpdates: true,
    });

    console.log(`[AUTH] Verification code for ${email}: ${verificationCode}`);

    res.status(201).json({
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        emailVerified: user.emailVerified,
        walletSetupDone: user.walletSetupDone,
        plan: user.plan,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      token,
      needsVerification: true,
      needsWalletSetup: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Missing credentials" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = generateToken();
    await db.update(usersTable).set({ sessionToken: token }).where(eq(usersTable.id, user.id));

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        emailVerified: user.emailVerified,
        walletSetupDone: user.walletSetupDone,
        plan: user.plan,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      token,
      needsVerification: !user.emailVerified,
      needsWalletSetup: user.emailVerified && !user.walletSetupDone,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    await db.update(usersTable).set({ sessionToken: null }).where(eq(usersTable.sessionToken, token));
  }
  res.json({ message: "Logged out" });
});

router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }
    if (user.emailVerificationCode !== code) {
      res.status(400).json({ error: "Invalid verification code" });
      return;
    }

    const token = generateToken();
    await db.update(usersTable).set({
      emailVerified: true,
      emailVerificationCode: null,
      sessionToken: token,
    }).where(eq(usersTable.id, user.id));

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        emailVerified: true,
        walletSetupDone: user.walletSetupDone,
        plan: user.plan,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      token,
      needsVerification: false,
      needsWalletSetup: !user.walletSetupDone,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/resend-code", async (req, res) => {
  try {
    const { email } = req.body;
    const code = generateVerificationCode();
    await db.update(usersTable).set({ emailVerificationCode: code }).where(eq(usersTable.email, email));
    console.log(`[AUTH] New verification code for ${email}: ${code}`);
    res.json({ message: "Code resent" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
