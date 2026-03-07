const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");

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
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send token as an httpOnly cookie and redirect to client
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .redirect(process.env.CLIENT_URL);
  }
);

// Return current user from JWT
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.userId).select(
      "displayName email profilePicture"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Logout — clear cookie
router.get("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

module.exports = router;
