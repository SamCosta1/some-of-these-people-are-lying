import React from "react";
import "./MainGame.scss"
import Injector from "../../../service/Injector";
import {Subscription} from "rxjs/internal/Subscription";
import {Article} from "../../../service/models/Article";
import {ArticleCardComponent} from "../ArticleCard/ArticleCardComponent";

interface State {
    articles: Article[]
}

export class MainGameComponent extends React.Component<any, State> {

    private subscriptions: Subscription[] = [];

    constructor(props: any) {
        super(props);

        this.state = {
            articles: []
        }
    }

    componentDidMount() {
        this.subscriptions.push(
            Injector.instance().gameService.articles.subscribe(articles => {
                this.setState({ articles })
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
                    this.state.articles.map(article => <ArticleCardComponent key={`${article.playerId}-${article.title}`} article={article}/>)
                }
            </div>
        )
    }
}