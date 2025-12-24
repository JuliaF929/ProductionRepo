//itemActionRepository - neutral interface

module.exports = {
    addItemAction: async (itemAction, session) => {},
    getAllItemsActions: async () => {},
    getActionsDoneForItemSN: async (itemSN) => {},
    getAllNarrowRuns: async () => {},
    getParametersForRun: async (itemSN, actionName, endExecutionDateTimeUTC) => {}
  };