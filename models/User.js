class User {
    constructor(id, username, password, email, role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
    }
}

module.exports = User;