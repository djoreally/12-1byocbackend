const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  Year: {
    type: Number,
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
  EngineOil: {
    type: String,
  },
  OilCapacity: {
    type: String,
  },
  OilPlugTorque: {
    type: String,
  },
  AutomaticTransmissionFluid: String,
  TransferCase: String,
  RearDifferential: String,
  FrontDifferential: String,
  OilLifeResetInstructions: String,
  ManualTransmissionFluid: String,
});

const AdminSchema = mongoose.Schema({
  cars: [carSchema],
});
module.exports = AdminSchema;
