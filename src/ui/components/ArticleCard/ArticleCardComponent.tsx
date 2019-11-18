import React from "react";
import "./ArticleCard.scss"
import {Article} from "../../../service/models/Article";
import Injector from "../../../service/Injector";

interface ArticleProps {
    article: Article,
    playerCanReveal: boolean
}

export class ArticleCardComponent extends React.Component<ArticleProps, any> {

    constructor(props: ArticleProps) {
        super(props);
        this.reveal = this.reveal.bind(this);
    }

    reveal() {
        Injector.instance().gameService.revealArticle(this.props.article).catch(e => {

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
                    this.props.playerCanReveal && !this.props.article.isRevealed &&
                        <button onClick={this.reveal}>Reveal</button>
                }
            </div>
        )
    }
}
