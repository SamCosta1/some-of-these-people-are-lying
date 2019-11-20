import React from "react";
import "./ArticleCard.scss"
import {Article} from "../../../service/models/Article";
import Injector from "../../../service/Injector";

interface ArticleProps {
    article: Article,
    playerCanRemove: boolean
}

export class ArticleCardComponent extends React.Component<ArticleProps, any> {

    constructor(props: ArticleProps) {
        super(props);
        this.remove = this.remove.bind(this);
    }

    remove() {
        Injector.instance().gameService.removeArticle(this.props.article).catch(e => {
            Injector.instance().errorService.pushError("Failed to remove article", e);
        })
    }

    render() {
        return (
            <div className="article-card-container">
                {
                    this.props.article.isRevealed &&
                    <div className="title">{ this.props.article.title }</div>
                }
                {
                    this.props.playerCanRemove && this.props.article.isRevealed &&
                    <button onClick={this.remove}>Delete</button>
                }
            </div>
        )
    }
}
