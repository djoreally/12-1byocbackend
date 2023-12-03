const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    required: true,
    type: String,
    unique: true,
  },
  phone: {
    type: String,
    trim:true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "customer",
    enum: ["customer", "provider"],
  },
  image: {
    type: String,
    default: "https://flowbite.com/images/logo.svg",
  },
  insurance: {
    type: String,
    default: "https://flowbite.com/images/logo.svg",
  },
  website: {
    type: String,
    default: "I have no website ",
  },
  address: {
    type: String,
    default: "streest/4#State",
  },
  resetToken: String,
  resetTokenExpiry: Date,
  Bookings: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Bookings",
    },
  ],
  stripeCustomerId: String,
});
module.exports = userSchema;
