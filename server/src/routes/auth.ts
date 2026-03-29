import express, { Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth";
import User from "../models/User";
import { UserDocument } from "../models/User";

const router = express.Router();

// Redirect to Google consent screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  (req: Request, res: Response) => {
    const user = req.user as UserDocument;
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .redirect(process.env.CLIENT_URL as string);
  }
);

// Return current user from JWT
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select(
      "displayName email profilePicture"
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Logout — clear cookie
router.get("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

export default router;
