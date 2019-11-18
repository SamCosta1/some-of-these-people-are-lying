import React from "react";
import "./MainGame.scss"
import Injector from "../../../service/Injector";
import {Subscription} from "rxjs/internal/Subscription";
import {Article} from "../../../service/models/Article";
import {ArticleCardComponent} from "../ArticleCard/ArticleCardComponent";
import {Player} from "../../../service/models/Player";

interface State {
    articles: Article[]
    player: Player | null
}

export class MainGameComponent extends React.Component<any, State> {

    private subscriptions: Subscription[] = [];

    constructor(props: any) {
        super(props);

        this.state = {
            articles: [],
            player: null
        }
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

    render() {
        return (
            <div>
                {
                    this.state.articles.map(article => <ArticleCardComponent key={`${article.playerId}-${article.title}`}
                                                                             article={article}
                                                                             playerCanReveal={this.state.player != null && this.state.player.isGuesser}/>)
                }
            </div>
        )
    }
}