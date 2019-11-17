import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";
import {GameState} from "./models/GameState";
import {LoggedIn} from "./models/AuthState";
import firebase from "firebase/app";
import "firebase/database"
import {Game} from "./models/Game";
import {Subject} from "rxjs/internal/Subject";
import AuthService from "./AuthService";

class GameService {

    state = new BehaviorSubject<GameState>(GameState.Loading);
    currentGame = new Subject<Game>();

    constructor(authService: AuthService) {
        authService.authState.subscribe(authState => {
            if (authState instanceof LoggedIn){
                GameService.currentGameRef(authState.userId).on("value", (snapshot => {
                    if (snapshot && snapshot.val()) {
                        this.currentGame.next(snapshot.val());
                        this.state.next(GameState.InGame)
                    } else {
                        this.state.next(GameState.PreGame)
                    }
                }))
            }
        })
    }

    private static currentGameRef(userId: string): firebase.database.Reference {
        return firebase.database().ref(`user/${userId}/current-game`)
    }

 }

 export default GameService