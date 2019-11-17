
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