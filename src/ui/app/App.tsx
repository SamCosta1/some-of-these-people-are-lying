import React from 'react';
import './App.scss';
import Injector from "../../service/Injector";
import {Subscription} from "rxjs/internal/Subscription";
import {LoggedIn, AuthError} from "../../service/models/AuthState";
import { combineLatest } from 'rxjs';
import {GameState} from "../../service/models/GameState";
import {TitleHeaderComponent} from "../components/TitleHeader/TitleHeaderComponent";
import {CreateJoinGameComponent} from "../components/CreateJoinGame/CreateJoinGame";
import {MainGameComponent} from "../components/MainGame/MainGameComponent";
import { ErrorHandlerComponent } from '../components/Error/ErrorHandlerComponent';
import {WikiSelectComponent} from "../components/WikiSelect/WikiSelectComponent";
import {WikiArticle} from "../../service/models/Wiki";

interface AppState {
    isLoading: boolean,
    gameState: GameState
    error: string
    wikiArticleTitle: string | null
    choosingWikiArticle: boolean
}

class App extends React.Component<any, AppState> {

  subscriptions: Subscription[] = [];

  constructor(props: any) {
      super(props);

      this.state = {
          isLoading: false,
          error: "",
          gameState: GameState.Loading,
          choosingWikiArticle: false,
          wikiArticleTitle: null
      };

      this.onWikiClosed = this.onWikiClosed.bind(this);
      this.showWikiSelector = this.showWikiSelector.bind(this);
  }

  componentDidMount() {
      // TODO: Stop using the deprecated method
      const loadingSub = combineLatest(
          [Injector.instance().authService.authState, Injector.instance().gameService.state],
          (authState, gameState) => {
                 return !(authState instanceof LoggedIn) || gameState === GameState.Loading
              }
      ).subscribe((isLoading) =>  this.setState({ isLoading: isLoading }));

      const authErrorSub = Injector.instance().authService.authState
          .subscribe(state => {
              if (state instanceof AuthError) {
                  this.setState({ error: state.message });
              }
          });

      const gameSub = Injector.instance().gameService.state
          .subscribe( gameState => this.setState({ gameState } ));

      this.subscriptions.push(loadingSub, authErrorSub, gameSub)

  }

  componentWillUnmount() {
     this.subscriptions.forEach((sub) => sub.unsubscribe() );
  }

  onWikiClosed(chosenArticle: WikiArticle | null) {
      this.setState({ choosingWikiArticle: false });

      if (chosenArticle) {
          this.setState({ wikiArticleTitle: chosenArticle.title });
      }
  }

  private showWikiSelector() {
      this.setState({ choosingWikiArticle: true })
  }

  render() {
      return (
        <div className="App">
              <header className="App-header">
                  <TitleHeaderComponent/>
                  <div className="error-container">{this.state.error}</div>
              </header>
            <ErrorHandlerComponent />
            <div className="main-body">
                { this.state.isLoading &&
                    <div className="loading-container">
                        <div className="lds-ripple"><div></div><div></div></div>
                    </div>
                }

                {
                    !this.state.isLoading && this.state.gameState === GameState.PreGame &&
                        <CreateJoinGameComponent/>
                }

                {
                    !this.state.isLoading && this.state.gameState === GameState.InGame &&

                    <MainGameComponent chosenArticleTitle={this.state.wikiArticleTitle}
                                       showWikiSelector={this.showWikiSelector}/>
                }
                </div>

            {
               this.state.choosingWikiArticle &&
                <div className="wiki-overlay">
                    <WikiSelectComponent close={this.onWikiClosed} />
                </div>
            }
        </div>

      );
    }
}

export default App;
