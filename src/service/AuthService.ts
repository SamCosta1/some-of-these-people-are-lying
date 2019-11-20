import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";
import firebase from "firebase/app";
import "firebase/auth"

import {AuthError, AuthState, LoggedIn, NotLoggedIn} from "./models/AuthState";

class AuthService {
    authState = new BehaviorSubject<AuthState>(NotLoggedIn);
    playerId: string | null = null;

    constructor() {
        firebase.auth().onAuthStateChanged(currentUser => {

            if (currentUser) {
                this.playerId = currentUser.uid;
                this.authState.next(new LoggedIn(currentUser.uid))
            } else {
                this.authState.next(new NotLoggedIn());
                this.login()
            }
        });


    }

    private login() {
        firebase.auth().signInAnonymously().catch(e => {
            this.authState.next(new AuthError(`Failed to authenticate with the mothership: ${e.message}`));
        })
    }
}

export default AuthService