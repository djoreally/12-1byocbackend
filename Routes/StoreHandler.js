const express = require("express");
const mongoose = require("mongoose");
const CreateStoreSchema = require("../Schemas/StoreSchema");
const userSchema = require("../Schemas/UserSchema");
const router = express.Router();
const cloudinary = require("cloudinary");
const CheckAuth = require("../Middleware/CheckAuth");

// mongoose model
const Store = new mongoose.model("Store", CreateStoreSchema);
const User = new mongoose.model("User", userSchema);

// CREATE OR UPDATE STORE
router.post("/CreateStore", CheckAuth, async (req, res) => {
  try {
    console.log(req.body.Services);
    const Logo = req.files?.Logo;
    const Thumbnail = req.files?.Thumbnail;
    let logoUrl, thumbnailUrl; // Declare variables to store Cloudinary URLs

    if (Logo) {
      const LogoResponse = await cloudinary.uploader.upload(Logo.tempFilePath);
      logoUrl = LogoResponse.secure_url; // Store the Cloudinary URL
    }

    if (Thumbnail) {
      const ThumbnailResponse = await cloudinary.uploader.upload(
        Thumbnail.tempFilePath
      );
      thumbnailUrl = ThumbnailResponse.secure_url; // Store the Cloudinary URL
    }

    // Check if a store with the same userId already exists
    let existingStore = await Store.findOne({ userId: req.userId });

    if (existingStore) {
      // Update the existing store's data
      existingStore.StoreName = req.body.StoreName;
      existingStore.Description = req.body.Description;
      existingStore.ServiceArea = req.body.ServiceArea;
      existingStore.address = req.body.address;
      existingStore.Tags = req.body.Tags;
      const servicesData = JSON.parse(req.body.Services);
      existingStore.Services = servicesData;

      if (logoUrl) existingStore.Logo = logoUrl;
      if (thumbnailUrl) existingStore.Thumbnail = thumbnailUrl;

      await existingStore.save();

      res.status(200).json({
        message: "Store Updated Successfully",
        data: existingStore,
      });
    } else {
      // Create a new store
      const newStore = new Store({
        StoreName: req.body.StoreName,
        Description: req.body.Description,
        ServiceArea: req.body.ServiceArea,
        Tags: req.body.Tags,
        address: req.body.address,
        Logo: logoUrl || "",
        Thumbnail: thumbnailUrl || "",
        userId: req.userId,
        user: req.userId,
      });

      await newStore.save();

      res.status(200).json({
        message: "Store Created Successfully",
        data: newStore,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
    console.log(error);
  }
});
//UPDATE DATAS
router.patch("/UpdateStore", CheckAuth, async (req, res) => {
  try {
    const store = await Store.findOneAndUpdate(
      { userId: req.userId },
      {
        ServiceHours: req.body.ServiceHours,
        timezone: req.body.timezone,
      },
      res.status(200).json({ message: "Store data updated succesfully" })
    );
    if (store) {
    } else {
      res.status(400).json({ message: "store not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
 
// GET STORE by ID
router.get("/GetStore/:id", async (req, res) => {
  try {
    const store = await Store.findOne({ userId: req.params.id }).populate({
      path: "Bookings",
      populate: {
        path: "user",
        select: "-password -Bookings",
      },
    });
    if (store) {
      if (store?.Subscribed) {
        res.status(200).json({
          message: "Store Data retrive succesful",
          data: store,
          Subscribed: store.Subscribed,
        });
      } else {
        res.status(403).json({
          message: "You have no active plan currently please choose one plan",
          Subscribed: store.Subscribed,
        });
      }
    } else {
      res.status(400).json({
        message: "Store not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//GET ALL STORE
router.get("/GetStore", async (req, res) => {
  try {
    const stores = await Store.find({ Subscribed: true }).populate(
      "user",
      "-password"
    );

    if (stores.length > 0) {
      res.status(200).json({
        message: "Store retrieve successful",
        data: stores,
      });
    } else {
      res.status(400).json({
        message: "No visible stores found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
