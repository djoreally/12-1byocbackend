const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const sendMail = require("../Middleware/MailSender");
const userSchema = require("../Schemas/UserSchema");
const storeSchema = require("../Schemas/StoreSchema");

const cloudinary = require("cloudinary");
const CheckAuth = require("../Middleware/CheckAuth");
const stripe = require("../utils/stripe");

const User = new mongoose.model("User", userSchema);
const Store = new mongoose.model("Store", storeSchema);

router.get("/prices", async (req, res) => {
  try {
    const prices = await stripe.prices.list(
      {
        active: true,
      },
      {
        apiKey: process.env.STRIPE_SECRET_KEY,
      }
    );

    res.status(200).json(prices);
  } catch (error) {
    console.error("Error fetching prices from Stripe:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// stripe session
router.post("/session", CheckAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    // Check if the user already has an active subscription
    const subscriptions = await stripe.subscriptions.list(
      {
        customer: user.stripeCustomerId,
        status: "active",
        expand: ["data.default_payment_method"],
      },
      {
        apiKey: process.env.STRIPE_SECRET_KEY,
      }
    );

    if (subscriptions.data.length > 0) {
      res.status(400).json({
        message: "You already have an active subscription.",
      });
    } else {
      // If no active subscription, create a new session
      const session = await stripe.checkout.sessions.create(
        {
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price: req.body.priceId, // Ensure this corresponds to a recurring price
              quantity: 1,
            },
          ],
          success_url: process.env.STRIPE_SUCCESS_URL,
          cancel_url: process.env.STRIPE_FAILURE_URL,
          customer: user.stripeCustomerId,
        },
        {
          apiKey: process.env.STRIPE_SECRET_KEY,
        }
      );

      return res.status(200).json(session);
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
});


//  get subscription
router.get("/subscriptions", CheckAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const subscriptions = await stripe.subscriptions.list(
      {
        customer: user.stripeCustomerId,
        status: "active",
        expand: ["data.default_payment_method"],
      },
      {
        apiKey: process.env.STRIPE_SECRET_KEY,
      }
    );

    if (subscriptions && subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const subscriptionEndDate = new Date(
        subscription.current_period_end * 1000
      );
      const currentDate = new Date();
      const hasSubscriptionEnded = currentDate > subscriptionEndDate;
      await Store.updateOne(
        { userId: req.userId },
        { Subscribed: !hasSubscriptionEnded }
      );
      res.status(200).json({
        subscriptions,
        subscriptionEndDate: subscriptionEndDate.toISOString(), // You can format the date as needed
        hasSubscriptionEnded,
      });
    } else {
      res.status(400).json({
        message: "You don't have any active subscription",
        hasSubscriptionEnded: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
