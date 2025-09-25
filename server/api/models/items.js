const mongoose = require('mongoose');

const ParameterSchema = new mongoose.Schema({
  name: String,
  description: String,
  type: String,
  defaultValue: String,
  value: String
}, { _id: false }); // prevents Mongoose from auto-generating _id for each param

//
const CalibrationAppSchema = new mongoose.Schema({
  name: String,
  datePassed: String
}, { _id: false }); // prevents Mongoose from auto-generating _id for each calib app

const ItemSchema = new mongoose.Schema({
  //_id: mongoose.Schema.Types.ObjectId,
  serialNumber: {type: String, required: true, unique: true},
  type: String,
  creationdate: String,
  releasedate: String,
  parameters: [ParameterSchema], //embedded array of params
  calibAppsPassed: [CalibrationAppSchema] //array of passed calib/test applications
});

module.exports = mongoose.model('Item', ItemSchema);