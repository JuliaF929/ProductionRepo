class User {
    constructor({ _id, name, email, roles, status, invitedBy }) {
      this._id = _id;
      this.name = name;
      this.email = email;
      this.roles = roles;
      this.status = status;
      this.invitedBy = invitedBy;
    }
  }
  
  module.exports = User;