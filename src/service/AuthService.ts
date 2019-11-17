import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";
import firebase from "firebase/app";
import "firebase/auth"

import {AuthState, LoggedIn, NotLoggedIn} from "./models/AuthState";

class AuthService {
    authState = new BehaviorSubject<AuthState>(NotLoggedIn);

    constructor() {
        const currentUser = firebase.auth().currentUser;

        if (currentUser) {
            this.authState.next(new LoggedIn(currentUser.uid))
        } else {
            this.authState.next(new NotLoggedIn());
        }
    }
}

export default AuthService