const express = require("express");
const router = express.Router();
const axios = require("axios");
const AdminSchema = require("../Schemas/AdminSchema");
const mongoose = require("mongoose");
// mongose models

const AdminData = new mongoose.model("AdminData", AdminSchema);

router.post("/zipcode", async (req, res) => {
  try {
    const response = await axios.get(
      "https://app.zipcodebase.com/api/v1/search",
      {
        params: {
          apikey: "db246b10-53c6-11ee-a9db-4db044694cc4",
          codes: req.body.codes,
          country: "US",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
router.get("/cars", async (req, res) => {
  try {
    const data = await mongoose.connection
      .collection("cars")
      .find()
      .toArray();

    if (!data) {
      res.status(400).json({
        message: "Data is not found",
      });
    } else if (data) {
      res.status(200).json({
        message: "Data is retrive",
        data: data,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;
