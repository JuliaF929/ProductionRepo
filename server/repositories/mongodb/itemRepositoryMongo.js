// repositories/mongodb/itemRepositoryMongo.js
const Item = require('../../api/models/items');
const logger = require('../../logger');
const mongoose = require('mongoose');


module.exports = {

    itemExists: async (itemSerialNumber) => 
    {
        return await Item.findOne({ serialNumber: itemSerialNumber });
    }, 

    addItem: async (item) => 
    {
        return await item.save();
    },

    getAllNarrowItems: async () => 
    {
        // Exclude parameters and calibAppsPassed arrays by setting them to 0
        return await Item.find({}, { parameters: 0, calibAppsPassed: 0 });
    },
    
    getActionsPassedForItem: async () => {},
    getParametersForItem: async () => {},
};
