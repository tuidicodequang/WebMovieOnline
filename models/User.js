class User {
    constructor(id, username, password,detail,role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.detail=detail;
        this.role = role;
    }
}

module.exports = User;