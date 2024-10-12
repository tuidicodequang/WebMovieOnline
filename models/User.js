class User {
    constructor(user_id, username, password, detail, role, last_login, created_at) {
        this.user_id = user_id;
        this.username = username;
        this.password = password;
        this.detail = detail;
        this.role = role;
        this.last_login = last_login;
        this.created_at = created_at;
    }
}

module.exports = User;
