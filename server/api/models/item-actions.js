const mongoose = require('mongoose');


const ActionParameterSchema = new mongoose.Schema({
    name: String,
    value: String
  }, { _id: false }); // prevents Mongoose from auto-generating _id for each param
  
const ItemActionSchema = new mongoose.Schema({
  //_id: mongoose.Schema.Types.ObjectId,
  itemSerialNumber: {type: String, required: true, unique: true},
  itemType: String,
  actionName: String,
  actionSWVersion: String,
  calibrixOperatorAppSWVersion: String,
  runStartdate: String,
  runStopdate: String,
  result: String,
  errorMsg: String,
  stationName: String,
  siteName: String,
  operatorName: String,
  parameters: [ActionParameterSchema], //embedded array of params
});

module.exports = mongoose.model('ItemAction', ItemActionSchema, 'itemActionsHistory');