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
    revealEnabled: boolean
}

interface Props {
    chosenArticleTitle: string | null
    showWikiSelector: () => void
}

export class MainGameComponent extends React.Component<Props, State> {

    private subscriptions: Subscription[] = [];

    constructor(props: Props) {
        super(props);

        this.state = {
            articles: [],
            player: Player.EMPTY,
            newArticleTitle: "",
            newArticleTitleValid: false,
            revealEnabled: true
        };

        this.onNewArticleTitleChanged = this.onNewArticleTitleChanged.bind(this);
        this.submitArticle = this.submitArticle.bind(this);
        this.becomeGuesser = this.becomeGuesser.bind(this);
        this.revealOne = this.revealOne.bind(this);
    }

    componentDidMount() {
        this.subscriptions.push(
            Injector.instance().gameService.articlesMinusGuessers.subscribe(articles => {
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

    componentDidUpdate(prevProps: Props) {
        if (this.props.chosenArticleTitle && prevProps.chosenArticleTitle !== this.props.chosenArticleTitle) {
            this.updateArticleTitle(this.props.chosenArticleTitle)
        }
    }

    private onNewArticleTitleChanged(e: any) {
        const newName: string = e.target.value;

        this.updateArticleTitle(newName);
    }

    private updateArticleTitle(newName: string) {
        this.setState({
            newArticleTitle: newName,
            newArticleTitleValid: newName.trim().length > 2
        });
    }

    private submitArticle() {
        Injector.instance().gameService.createArticle(this.state.newArticleTitle).then(() => {
            this.setState({
                newArticleTitle: '',
                newArticleTitleValid: false
            });
        }).catch(e => {
            Injector.instance().errorService.pushError("Failed to submit article", e);
        });
    }

    private becomeGuesser() {
        Injector.instance().gameService.becomeGuesser().catch(e => {
            Injector.instance().errorService.pushError("Failed to become Tom Scott", e);
        })
    }

    private revealOne() {
        this.setState({ revealEnabled: false });

        Injector.instance().gameService.revealRandomArticle().catch(err => {
            Injector.instance().errorService.pushError("Couldn't reveal article", err);
        }).finally(() => {
            setTimeout(() => {
                this.setState({ revealEnabled: true});
            }, 1000)
        })
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
                        <button onClick={this.props.showWikiSelector}>Choose from Wikipedia</button>
                        <div>Or...</div>
                        <button onClick={this.becomeGuesser}>Become Tom Scott</button>
                    </div>
                }

                {
                    this.state.player !== Player.EMPTY && this.state.player.isGuesser &&
                    <div className="article-entry-container">
                        <button disabled={!this.state.revealEnabled} onClick={this.revealOne}>Reveal One!</button>
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