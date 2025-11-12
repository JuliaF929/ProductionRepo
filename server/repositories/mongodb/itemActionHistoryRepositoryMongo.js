// repositories/mongodb/itemActionRepositoryMongo.js
const ItemAction = require('../../api/models/item-actions');
const logger = require('../../logger');
const mongoose = require('mongoose');


module.exports = {

    addItemAction: async (itemAction, session) => 
    {
        try
        {
            return await itemAction.save({ session });
        }
        catch (error) 
        {
            logger.error(`Error adding action ${itemAction.actionName} for itemSN ${itemAction.itemSerialNumber}: ${error.message}`);
            throw error;
        }
    },

    getAllItemsActions: async () => 
    {
        try
        {
            return await ItemAction.find({});
        }
        catch (error) 
        {
            logger.error(`Error retrieving all items actions : ${error.message}`);
            throw error;
        }
    },

    getActionsDoneForItemSN: async (itemSN) => 
    {
        try 
        {
            return await ItemAction.find({ itemSerialNumber: itemSN });
        } 
        catch (error) 
        {
            logger.error(`Error retrieving actions for item SN ${itemSN}: ${error.message}`);
            throw error;
        }
    }
};
