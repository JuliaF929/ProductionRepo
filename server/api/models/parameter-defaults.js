class ParameterDefault {
    constructor({ _id, name, description, type, defaultValue, itemTypeID }) {
      this._id = _id;
      this.name = name;
      this.description = description;
      this.type = type;
      this.defaultValue = defaultValue;
      this.itemTypeID = itemTypeID;
    }
  }
  
  module.exports = ParameterDefault;