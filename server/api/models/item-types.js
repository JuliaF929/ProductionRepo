class ItemType {
    constructor({ _id, name, description, SNPrefix }) {
      this._id = _id;
      this.name = name;
      this.description = description;
      this.SNPrefix = SNPrefix;
    }
  }
  
  module.exports = ItemType;