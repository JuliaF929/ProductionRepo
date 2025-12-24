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
        try
        {
            // Exclude parameters array by setting them to 0
            return await Item.find({}, { parameters: 0 });
        } 
        catch (error) 
        {
            logger.error(`Error retrieving narrow items: ${error.message}`);
            throw error;
        }
    },
    
    getActionsPassedForItem: async () => {},
    
    getParametersForItem: async (itemSerialNumber) => 
    {
        const item = await Item.findOne({ serialNumber: itemSerialNumber }, { parameters: 1, _id: 0 });
        return item ? item.parameters : null;
    },

    updateItemParameters: async (itemSerialNumber, newParams, session) => {
        try {
            // Get the existing item with only parameters field
            const item = await Item.findOne(
                { serialNumber: itemSerialNumber },
                { parameters: 1 }
            );
    
            if (!item) {
                logger.error(`Item ${itemSerialNumber} not found`);
                return null;
            }
    
            // Convert existing array to a map for quick lookup
            const paramMap = new Map();
            item.parameters.forEach(p => {
                paramMap.set(p.name, p.toObject ? p.toObject() : p);
            });

            logger.debug(`Existing parameters array for item ${itemSerialNumber}: ${JSON.stringify(item.parameters, null, 2)}`);
            logger.debug(`Existing parameters map for item ${itemSerialNumber}: ${JSON.stringify(Object.fromEntries(paramMap), null, 2)}`);
 
            // Merge incoming params: update or insert
            newParams.forEach(p => {
                if (paramMap.has(p.name)) {
                    // Update only .value
                    paramMap.get(p.name).value = p.value;
                } else {
                    // Add new parameter (only name + value)
                    paramMap.set(p.name, { 
                        name: p.name, 
                        value: p.value,
                        description: "",
                        type: "",
                        defaultValue: ""
                    });
                }
            });

            logger.debug(`Merged parameters for item ${itemSerialNumber}: ${JSON.stringify(Array.from(paramMap.values()), null, 2)}`);
    
            // Convert map back to array
            const mergedParams = Array.from(paramMap.values());
    
            // Update DB
            const result = await Item.updateOne(
                { serialNumber: itemSerialNumber },
                { $set: { parameters: mergedParams }},
                { session }
            );
    
            return result;
        } catch (err) {
            logger.error(`Error updating parameters for item ${itemSerialNumber}: ${err}`);
            return null;
        }
    },
    
};
