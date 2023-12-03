const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  Year: {
    type: String,
  },
  Make: {
    type: String,
  },
  Model: {
    type: String,
  },
  Engine: {
    type: String,
  },
  "Engine Oil": {
    type: String,
  },
  "Oil Capacity": {
    type: String,
  },
  "Oil Plug Torque": {
    type: String,
  },
  "Automatic Transmission Fluid": {
    type: String,
    default: "",
  },
  "Transfer Case": {
    type: String,
    default: "",
  },
  "Rear Differential": {
    type: String,
    default: "",
  },
  "Front Differential": {
    type: String,
    default: "",
  },
  "Oil Life Reset Instructions": {
    type: String,
    default: "",
  },
  "Manual Transmission Fluid": {
    type: String,
    default: "",
  },
});
const locationSchema = new mongoose.Schema({
  postal_code: String,
  country_code: String,
  latitude: String,
  longitude: String,
  city: String,
  state: String,
  city_en: String,
  state_en: String,
  state_code: String,
  province: String,
  province_code: String,
});
const selectedService = new mongoose.Schema({
  service: String,
  price: String,
  serviceDescription: String,
});

const BookingSchema = mongoose.Schema({
  Vehicle: [VehicleSchema],
  Location: [locationSchema],
  Date: String,
  Time: String,
  TotalPrice: Number,
  serviceCharge: Number,
  selectedService: [selectedService],
  street: String,
  apt: String,
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "complete", "cancel"],
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  provider: {
    type: mongoose.Types.ObjectId,
    ref: "Store",
  },
});

module.exports = BookingSchema;
