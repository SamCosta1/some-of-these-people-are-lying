import React from "react";
import "./MainGame.scss"
import Injector from "../../../service/Injector";
import {Subscription} from "rxjs/internal/Subscription";
import {Article} from "../../../service/models/Article";
import {ArticleCardComponent} from "../ArticleCard/ArticleCardComponent";
import {Player} from "../../../service/models/Player";

interface State {
    articles: Article[]
    player: Player
    newArticleTitle: string
    newArticleTitleValid: boolean
}

export class MainGameComponent extends React.Component<any, State> {

    private subscriptions: Subscription[] = [];

    constructor(props: any) {
        super(props);

        this.state = {
            articles: [],
            player: Player.EMPTY,
            newArticleTitle: "",
            newArticleTitleValid: false
        };

        this.onNewArticleTitleChanged = this.onNewArticleTitleChanged.bind(this);
        this.submitArticle = this.submitArticle.bind(this);
        this.becomeGuesser = this.becomeGuesser.bind(this);
        this.revealOne = this.revealOne.bind(this);
    }

    componentDidMount() {
        this.subscriptions.push(
            Injector.instance().gameService.articles.subscribe(articles => {
                this.setState({ articles });
            })
        );

        this.subscriptions.push(
            Injector.instance().gameService.currentPlayer.subscribe(player => {
                this.setState({ player });
            })
        );
    }

    componentWillUnmount() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    private onNewArticleTitleChanged(e: any) {
        const newName: string = e.target.value;

        this.setState({
            newArticleTitle: newName,
            newArticleTitleValid: newName.trim().length > 2
        });
    }

    private submitArticle() {
        Injector.instance().gameService.createArticle(this.state.newArticleTitle).catch(e => {
            Injector.instance().errorService.pushError("Failed to submit article", e);
        });
    }

    private becomeGuesser() {
        Injector.instance().gameService.becomeGuesser().catch(e => {
            Injector.instance().errorService.pushError("Failed to become Tom Scott", e);
        })
    }

    private revealOne() {
        Injector.instance().gameService.revealRandomArticle()
    }

    render() {
        return (

            <div>
                {   this.state.player !== Player.EMPTY && !this.state.player.isGuesser &&
                    <div className="article-entry-container">
                        <div className="article-entry">
                        <input type="text" placeholder="Enter your article name here" value={this.state.newArticleTitle} onChange={this.onNewArticleTitleChanged}/>
                        {
                            this.state.newArticleTitleValid &&
                                <button onClick={this.submitArticle}>Submit / Update article</button>
                        }
                        </div>
                        <div>Or...</div>
                        <button onClick={this.becomeGuesser}>Become Tom Scott</button>
                    </div>
                }

                {
                    this.state.player !== Player.EMPTY && this.state.player.isGuesser &&
                    <div className="article-entry-container">
                        <button onClick={this.revealOne}>Reveal One!</button>
                    </div>
                }
                <div className="articles-container">
                    {
                        this.state.articles.map(article => <ArticleCardComponent key={`${article.playerId}-${article.title}`}
                                                                                 article={article}
                                                                                 playerCanRemove={this.state.player.isGuesser}/>)
                    }
                </div>
            </div>
        )
    }
}