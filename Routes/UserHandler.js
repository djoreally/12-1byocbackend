const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const sendMail = require("../Middleware/MailSender");
const userSchema = require("../Schemas/UserSchema");
const cloudinary = require("cloudinary");
const CheckAuth = require("../Middleware/CheckAuth");
const stripe = require("../utils/stripe");
const accountSid = "AC68fbae21de943ef3324c791e00ab2723";
const authToken = "59b2545a2bf7d67d781ecf99e11a0a82";
const client = require("twilio")(accountSid, authToken);
// mongose models
const User = new mongoose.model("User", userSchema);

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    // check if acccount exist
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      throw new Error("this email is already exist ");
    }
    const existingPhone = await User.findOne({ phone: req.body.phone });
    if (existingPhone) {
      throw new Error("this phone is already exist");
    }
    const customer = await stripe.customers.create(
      {
        email: req.body.email,
      },
      {
        apiKey: process.env.STRIPE_SECRET_KEY,
      }
    );
    //   hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // create new user
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      role: req.body.role,
      stripeCustomerId: customer.id,
    });
    await newUser.save();

    res.status(200).json({
      message: "Signup successful!",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.find({ email: req.body.email });
    if (user && user.length > 0) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user[0].password
      );
      const customer = await stripe.customers.create(
        {
          email: user[0].email,
        },
        {
          apiKey: process.env.STRIPE_SECRET_KEY,
        }
      );
      if (isValidPassword) {
        const token = jwt.sign(
          {
            userId: user[0]._id,
            userEmail: user[0].email,
            role: user[0].role,
            name: user[0].name,
            phone: user[0].phone,
            loggedIn: true,
            stripeCustomerId: customer.id,
          },
          process.env.JWT,
          {
            expiresIn: "60d",
          }
        );

        res.cookie("token", token);
        res.status(200).json({
          accessToken: token,
          message: "Login successful ",
        });
      } else {
        res.status(401).json({
          error: "Authentication failed!",
        });
      }
    } else {
      res.status(401).json({
        error: "Authentication failed!",
      });
    }
  } catch (error) {
    res.status(401).json({
      error: "Authentication failed!",
    });
  }
});

// FORGOT PASSWORD
router.post("/forgotpassword", async (req, res) => {
  try {
    const { email, phone } = req.body;
    const user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user) {
      return res.status(404).json({ error: "Account dosen't exist" });
    }
    const resetToken = Math.floor(Math.random() * 1000000 + 1);
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 500000; // Token expiry time (5 minutes)
    await user.save();
    if (email) {
      // Read the HTML template logo
      const templatePath = path.join(
        __dirname,
        "../",
        "EmailTamplates",
        "passwordReset.html"
      );
      const templateContent = await fs.readFile(templatePath, "utf8");

      // Replace the placeholder with the actual message
      const message = resetToken;
      const html = templateContent
        .replace("{{message}}", message)
        .replace("{{user.name}}", user.name);
      // Send the email
      const from =
        '"Book your oil change " <Customerservice@bookyouroilchange.com>';
      const to = user.email;
      const subject = "Book your oil change Password reset token";
      const text = "Book your oil change Password reset token";
      const info = await sendMail(from, to, subject, text, html);
      res.json(info);
    } else if (phone) {
      const result = await client.messages.create({
        body: `Your Book Your Oil Change account password reset OTP is: ${resetToken}. Please enter this code to reset your password. Do not share this code with anyone for security reasons. Thank you!`,
        to: `+1${user.phone}`, // Text your number
        from: "+12676094476", // From a valid Twilio number
      });
      console.log(result); // or perform other actions
      res.status(200).json({
        message:"OTP sended on number"
      })
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to send SMS." });
    console.log(error);
  }
});

//VERIFY OTP
router.post("/verifyotp", async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
    res.status(200).json({ message: "Verified", verified: true });
  } catch (error) {
    res.status(500).json({ error: "Password reset failed." });
  }
});
//RESEST PASSWORD
router.post("/resetpassword", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    // Update the user's password with the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.status(200).json({ message: "Verified", verified: true });
  } catch (error) {
    res.status(500).json({ error: "Password reset failed." });
  }
});

// UPDATE USER PROFILE
router.patch("/updateProfile", CheckAuth, async (req, res) => {
  try {
    const logo = req.files?.image;
    const insurance = req.files?.insurance;
    const { website, name, phone, address } = req.body;

    const updateData = { website, name, phone, address };

    if (logo) {
      const cloudinaryResponse = await cloudinary.uploader.upload(
        logo.tempFilePath
      );
      updateData.image = cloudinaryResponse.secure_url;
    }
    if (insurance) {
      const cloudinaryResponse = await cloudinary.uploader.upload(
        insurance.tempFilePath
      );
      updateData.insurance = cloudinaryResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    });

    if (updatedUser) {
      res.status(200).json({
        message: "User data updated successfully!",
        user: updatedUser,
      });
    } else {
      res.status(404).json({
        message: "User not found!",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// GET USER DATA
router.get("/GetUserData", CheckAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate({
        path: "Bookings",
        populate: {
          path: "provider",
          select: " StoreName Logo address",
          populate: {
            path: "user",
            select: "-password",
          },
        },
      });
    if (user) {
      res.status(200).json({
        result: user,
        message: "user data get succesfull",
      });
    } else if (!user) {
      res.status(400).json({
        message: "user not found",
      });
    } else {
      res.status(500).json({
        message: "There was an server side error",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});
module.exports = router;
