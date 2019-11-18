import React from "react";
import "./ArticleCard.scss"
import {Article} from "../../../service/models/Article";

interface ArticleProps {
    article: Article
}

export class ArticleCardComponent extends React.Component<ArticleProps, any> {

    render() {
        return (
            <div className="article-card-container">
                {
                    this.props.article.isRevealed &&
                    <div className="title">{ this.props.article.title }</div>
                }
            </div>
        )
    }
}
