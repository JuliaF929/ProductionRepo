//testApplicationRepository - neutral interface

module.exports = {
    addTestApplication: async (testApplication) => { /* Implement for Sheets or MongoDB or other DB*/ },
    getAllTestApplications: async () => { /* Implement for Sheets or MongoDB or other DB*/ },
    deleteTestApplicationByUUID: async (uuid) => { /* Implement for Sheets or MongoDB or other DB*/ }
  };