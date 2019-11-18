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
import {RawArticleSnapshot, RawPlayersSnapshot} from "./models/RawGameSnapshot";
import {Article} from "./models/Article";
import {Subscription} from "rxjs/internal/Subscription";
import Injector from "./Injector";
import {shuffleArray} from "../util/ArrayUtils";

class GameService {

    state = new BehaviorSubject<GameState>(GameState.Loading);
    currentGameMeta = new BehaviorSubject<GameMetaData>(GameMetaData.EMPTY);
    players = new Subject<Player[]>();
    articles = new Subject<Article[]>()

    private dbRefs: firebase.database.Reference[] = [];
    private subscriptions: Subscription[] = [];

    constructor(authService: AuthService) {
        authService.authState.subscribe(authState => {
            if (!(authState instanceof LoggedIn) || this.state.value !== GameState.Loading) {
                return
            }

            this.dbRefs.forEach(ref => ref.off());
            this.subscriptions.forEach(it => it.unsubscribe());
            this.dbRefs = [];

            this.userGameRef(authState.userId).on('value', (gameIdSnapshot => {
                if (gameIdSnapshot && gameIdSnapshot.val()) {
                    this.updatePlayers(authState, gameIdSnapshot.val());
                    this.updateGameMeta(gameIdSnapshot.val());

                    this.state.next(GameState.InGame)
                } else {
                    this.state.next(GameState.PreGame)
                }
            }));

            const gameSub = this.currentGameMeta.subscribe((gameMetaData) => {
                this.articlesRef(gameMetaData.id).on('value', articlesSnapshot => {
                    let articles: Article[] = [];
                    articlesSnapshot.forEach(childSnapshot => {

                        if (childSnapshot.key) {
                            const rawArticle: RawArticleSnapshot = childSnapshot.val();
                            articles.push(new Article(childSnapshot.key, rawArticle.title, rawArticle.isRevealed,childSnapshot.key === authState.userId))
                        }
                    });

                    this.articles.next(shuffleArray(articles))
                })
            });

            this.subscriptions.push(gameSub);
        });
    }

    updateArticle(article: Article): Promise<any> {
        const playerId = Injector.instance().authService.playerId;
        if (this.currentGameMeta.value === GameMetaData.EMPTY || !playerId) {
            throw Error("Not currently in a game, this should never happen");
        }

        return this.playerArticleRef(this.currentGameMeta.value.id, playerId).set({
            title: article.title,
            isRevealed: article.isRevealed
        });
    }

    joinGame(name: string): Promise<firebase.functions.HttpsCallableResult> {
        return firebase.functions().httpsCallable("joinGame")({
            gameName: name
        })
    }

    createGame(name: string): Promise<firebase.functions.HttpsCallableResult> {
        return firebase.functions().httpsCallable("createAndJoinGame")({
            gameName: name
        })
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

    private articlesRef(gameId: string): firebase.database.Reference {
        return this.getRef(`games/${gameId}/articles`)
    }

    private playerArticleRef(gameId: string, playerId: string): firebase.database.Reference {
        return firebase.database().ref(`games/${gameId}/articles/${playerId}`)
    }

    private getRef(refStr: string): firebase.database.Reference {
        const ref = firebase.database().ref(refStr);
        this.dbRefs.push(ref);
        return ref;
    }

 }

 export default GameService