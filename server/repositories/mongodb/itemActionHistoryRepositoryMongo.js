// repositories/mongodb/itemActionRepositoryMongo.js
const ItemAction = require('../../api/models/item-actions');
const logger = require('../../logger');
const mongoose = require('mongoose');


module.exports = {

    addItemAction: async (itemAction) => 
    {
        return await itemAction.save();
    },

    getAllItemsActions: async () => 
    {
        return await ItemAction.find({});
    },
};
