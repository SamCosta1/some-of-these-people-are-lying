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
import { combineLatest } from 'rxjs';

class GameService {

    state = new BehaviorSubject<GameState>(GameState.Loading);
    currentGameMeta = new BehaviorSubject<GameMetaData>(GameMetaData.EMPTY);
    players = new Subject<Player[]>();
    currentPlayer = new BehaviorSubject<Player>(Player.EMPTY);
    currentGuesser = new BehaviorSubject<Player>(Player.EMPTY);

    private _articles = new BehaviorSubject<Article[]>([]);
    articlesMinusGuessers = new BehaviorSubject<Article[]>([]);

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

                    this._articles.next(shuffleArray(articles))
                })
            });

            const playersSub = this.players.subscribe(players => {
                this.currentPlayer.next(players.find(p => p.isThisPlayer) || Player.EMPTY);
            });

            this.subscriptions.push(gameSub, playersSub);
        });
        
        combineLatest([this._articles, this.players], (articles, players) => {
            const guesser = players.find(player => player.isGuesser) || Player.EMPTY;
            return articles.filter(article => article.playerId !== guesser.id)
        }).subscribe(articles => this.articlesMinusGuessers.next(articles))

        this.players.subscribe(players => {
            const player = players.find(player => player.isGuesser);
            
            if (player) {
                this.currentGuesser.next(player)
            }
        })
    }

    private updateArticle(article: Article): Promise<any> {
        const playerId = Injector.instance().authService.playerId;
        if (this.currentGameMeta.value === GameMetaData.EMPTY || !playerId) {
            throw Error("Not currently in a game, this should never happen");
        }

        return this.playerArticleRef(this.currentGameMeta.value.id, article.playerId).set({
            title: article.title,
            isRevealed: article.isRevealed
        });
    }

    revealArticle(article: Article): Promise<any> {
        article.isRevealed = true;
        return this.updateArticle(article)
    }

    createArticle(newArticleTitle: string): Promise<any> {
        return this.updateArticle(new Article(this.currentPlayer.value.id, newArticleTitle, false, true))
    }

    becomeGuesser(): Promise<any> {
        return this.currentGuesserRef(this.currentGameMeta.value.id).set(this.currentPlayer.value.id)
    }

    removeArticle(article: Article): Promise<any> {
        return this.playerArticleRef(this.currentGameMeta.value.id, article.playerId).set(null);
    }

    revealRandomArticle(): Promise<any> {
        const articles = this.articlesMinusGuessers.value.filter(article => !article.isRevealed);
        const numArticles = articles.length;
        console.log(numArticles);
        if (numArticles === 0) {
            return Promise.reject({ message: "No articles to reveal" })
        }

        const randIndex = Math.floor(Math.random() * numArticles);
        const random = articles[randIndex];
        return this.revealArticle(random)
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

    async leaveGame() {
        this.state.next(GameState.Loading);
        await firebase.functions().httpsCallable("leaveCurrentGame")();
    }

    private updateGameMeta(gameId: string) {
        this.getRef(`games/${gameId}/name`).on("value", nameSnapshot => {
            this.currentGameMeta.next(new GameMetaData(gameId, nameSnapshot.val()))
        })
    }

    private updatePlayers(loggedIn: LoggedIn, gameId: string) {
        this.gamePlayersRef(gameId).on("value", (snapshot) => {
            const rawPlayers: RawPlayersSnapshot = snapshot.val();
            const ids: string[] = Object.keys(rawPlayers.ids) || [];

            this.players.next(ids.map(id =>
                new Player(id, id === loggedIn.userId, id === rawPlayers.currentGuesserId)
            ));
        });
    }

    private gamePlayersRef(gameId: string): firebase.database.Reference {
        return this.getRef(`games/${gameId}/players`)
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

    private currentGuesserRef(gameId: string) {
        return this.getRef(`games/${gameId}/players/currentGuesserId`)
    }

    private getRef(refStr: string): firebase.database.Reference {
        const ref = firebase.database().ref(refStr);
        this.dbRefs.push(ref);
        return ref;
    }

}

 export default GameService