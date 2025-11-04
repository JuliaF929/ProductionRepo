// repositories/mongodb/itemActionRepositoryMongo.js
const ItemAction = require('../../api/models/item-actions');
const logger = require('../../logger');
const mongoose = require('mongoose');


module.exports = {

    addItemAction: async (itemAction, session) => 
    {
        return await itemAction.save({ session });
    },

    getAllItemsActions: async () => 
    {
        return await ItemAction.find({});
    },
};
