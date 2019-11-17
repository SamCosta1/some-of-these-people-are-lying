import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";
import {GameState} from "./models/GameState";
import {LoggedIn} from "./models/AuthState";
import firebase from "firebase/app";
import "firebase/database"
import "firebase/functions"
import {GameMetaData} from "./models/GameMetaData";
import {Subject} from "rxjs/internal/Subject";
import AuthService from "./AuthService";
import {Player} from "./models/Player";
import {RawPlayersSnapshot} from "./models/RawGameSnapshot";

class GameService {

    state = new BehaviorSubject<GameState>(GameState.Loading);
    currentGameMeta = new Subject<GameMetaData>();
    players = new Subject<Player[]>();

    private dbRefs: firebase.database.Reference[] = [];

    constructor(authService: AuthService) {
        authService.authState.subscribe(authState => {
            if (!(authState instanceof LoggedIn) || this.state.value !== GameState.Loading) {
                return
            }

            this.dbRefs.forEach(ref => ref.off());
            this.dbRefs = [];

            this.userGameRef(authState.userId).on("value", (gameIdSnapshot => {
                if (gameIdSnapshot && gameIdSnapshot.val()) {
                    this.updatePlayers(authState, gameIdSnapshot.val());
                    this.updateGameMeta(gameIdSnapshot.val());

                    this.state.next(GameState.InGame)
                } else {
                    this.state.next(GameState.PreGame)
                }
            }));

        });
    }

    async joinGame(name: string) {
        const result = await firebase.functions().httpsCallable("joinGame")({
            gameName: name
        });

        console.log(result);
    }

    private updateGameMeta(gameId: string) {
        this.getRef(`games/${gameId}/name`).on("value", nameSnapshot => {
            this.currentGameMeta.next(new GameMetaData(gameId, nameSnapshot.val()))
        })
    }

    private updatePlayers(loggedIn: LoggedIn, gameId: string) {
        this.gamePlayersRef(gameId).on("value", (snapshot) => {
            const rawPlayers: RawPlayersSnapshot = snapshot.val();
            const ids: string[] = rawPlayers.playerIds || [];

            this.players.next(ids.map(id =>
                new Player(id, id === loggedIn.userId, id === rawPlayers.currentGuesserId)
            ));
        });
    }

    private gamePlayersRef(gameId: string): firebase.database.Reference {
        return this.getRef(`games/${gameId}/players/ids`)
    }

    private userGameRef(userId: string): firebase.database.Reference {
        return this.getRef(`users/${userId}/current-game`);
    }

    private getRef(refStr: string): firebase.database.Reference {
        const ref = firebase.database().ref(refStr);
        this.dbRefs.push(ref);
        return ref;
    }

 }

 export default GameService