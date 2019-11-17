
export interface AuthState {

}

export class LoggedIn implements AuthState {
    userId: string;

    constructor(userId: string) {
        this.userId = userId
    }
}

export class NotLoggedIn implements AuthState {

}

export class AuthError implements AuthState {
    message: string;

    constructor(message: string) {
        this.message = message;
    }
}