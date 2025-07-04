class TestApplication {
    constructor({ _id, name, versionNumber, description, ECONumber, UploadDate, EffectiveDate, UploadUser, Path }) {
      this._id = _id;
      this.name = name;
      this.versionNumber = versionNumber;
      this.description = description;
      this.ECONumber = ECONumber;
      this.UploadDate = UploadDate;
      this.EffectiveDate = EffectiveDate;
      this.UploadUser = UploadUser;
      this.Path = Path;
    }
  }
  
  module.exports = TestApplication;