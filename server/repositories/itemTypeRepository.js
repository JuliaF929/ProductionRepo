//itemTypeRepository - neutral interface

module.exports = {
    addItemType: async (itemType) => { /* Implement for Sheets or MongoDB or other DB*/ },
    getAllItemTypes: async () => { /* Implement for Sheets or MongoDB or other DB*/ },
    deleteItemTypeByUUID: async (uuid) => { /* Implement for Sheets or MongoDB or other DB*/ }
  };