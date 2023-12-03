const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const BookingSchema = require("../Schemas/BookingSchema");
const CheckAuth = require("../Middleware/CheckAuth");
const userSchema = require("../Schemas/UserSchema");
const CreateStoreSchema = require("../Schemas/StoreSchema");
const Store = new mongoose.model("Store", CreateStoreSchema);

const User = new mongoose.model("User", userSchema);
const BookingModel = new mongoose.model("Bookings", BookingSchema);

// POST BOOKING

router.post("/CreateBooking", CheckAuth, async (req, res) => {
  try {
    const {
      Vehicle,
      Location,
      Date,
      Time,
      TotalPrice,
      serviceCharge,
      selectedService,
      street,
      apt,
    } = req.body;

    const booking = new BookingModel({
      Vehicle,
      Location,
      Date,
      Time,
      TotalPrice,
      serviceCharge,
      selectedService,
      street,
      apt,
      user: req.userId,
      provider: req.body.storeId,
    });

    const BookingData = await booking.save();
    // create relation with user
    await User.updateOne(
      {
        _id: req.userId,
      },
      {
        $push: {
          Bookings: BookingData._id,
        },
      }
    );
    // create relation with provider
    await Store.updateOne(
      {
        _id: req.body.storeId,
      },
      {
        $push: {
          Bookings: BookingData._id,
        },
      }
    );
    res.status(201).json({ message: "Booking created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/UpdateStatus/:bookingId", CheckAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { bookingId } = req.params;

    const booking = await BookingModel.findOne({
      _id: bookingId,
      provider: req.userId,
    });
    if (!booking) {
      return res
        .status(404)
        .json({ error: "Booking not found or unauthorized access" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: "Booking status updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/GetBooking", CheckAuth, async (req, res) => {
  try {
    const bookings = await BookingModel.find({
      provider: "650074cb9821943f32b01827",
    });
    if (bookings.length > 0) {
      res.status(200).json(bookings);
    } else {
      res.status(404).json({ message: "No bookings found for the user." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
// data is updated