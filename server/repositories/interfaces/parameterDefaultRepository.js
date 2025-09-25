//parameterDefaultRepository - neutral interface

module.exports = {
    addParameterDefault: async (parameterDefault) => { /* Implement for Sheets or MongoDB or other DB*/ },
    getAllParameterDefaults: async () => { /* Implement for Sheets or MongoDB or other DB*/ },
    getAllParameterDefaultsForItemType: async (itemTypeID) => { /* Implement for Sheets or MongoDB or other DB*/ }, 
    deleteParameterDefaultByUUID: async (uuid) => { /* Implement for Sheets or MongoDB or other DB*/ }
  };