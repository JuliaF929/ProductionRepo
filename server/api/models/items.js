const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serialNumber: String,
    name: String//julia - delete this, add others (itemType, doneCalibrApps, parameters)
});

module.exports = mongoose.model('Item', itemSchema);