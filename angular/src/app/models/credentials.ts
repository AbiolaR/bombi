export class Credentials {
    username: string = '';
    password: string = '';

    private emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
    minimumPasswordLength = 6;

    constructor(username: string = '', password: string = '') {
        this.username = username;
        this.password = password;    
    }

    valid(ignorePassword = false): boolean {
        if (ignorePassword) {
            return Boolean(this.username.match(this.emailRegex));
        }
        return (this.username.match(this.emailRegex) || false)
            && (this.password.length >= this.minimumPasswordLength);
    }
}