//itemRepository - neutral interface

module.exports = {
    itemExists: async (itemSerialNumber) => {}, 
    addItem: async (item) => {},
    getAllNarrowItems: async () => {},
    getActionsPassedForItem: async () => {},
    getParametersForItem: async () => {},
    updateItemParameters: async (itemSerialNumber, newParams, session) => {},
  };