const mongoose = require("mongoose");

const ServicesSchema = new mongoose.Schema({
  service: String,
  price: String,
  serviceDescription: String,
});

const ServiceHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    default: "00:00",
  },
  from: {
    type: String,
    default: "00:00",
  },
  to: {
    type: String,
    default: "00:00",
  },
  status: {
    type: Boolean,
    default: false,
  },
  Bookings: [
    {
      type: mongoose.Types.ObjectId,
      ref: "BookingModel",
    },
  ],
});

const CreateStoreSchema = mongoose.Schema({
  StoreName: String,
  Description: String,
  ServiceArea: String,
  Tags: String,
  Logo: String,
  Thumbnail: String,
  address: String,
  Services: [ServicesSchema],
  userId: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  totalJobs: {
    type: String,
    default: "0",
  },
  Queue: {
    type: String,
    default: "0",
  },
  reviews: { 
    type: String,
    default: "0",
  },
  Subscribed: {
    type: Boolean,
    default: false,
  },
  ServiceHours: [ServiceHoursSchema],
  timezone: {
    type: String,
  },
  Bookings: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Bookings",
    },
  ],
});

module.exports = CreateStoreSchema;
