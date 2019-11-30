import React from "react";
import "./WikiSelect.scss"
import Injector from "../../../service/Injector";
import {WikiArticle} from "../../../service/models/Wiki";
import {Subscription} from "rxjs/internal/Subscription";
import {filter} from "rxjs/operators";

interface Props {
    close: (chosenWikiArticle: WikiArticle | null) => void
}

interface State {
    wikiArticle: WikiArticle | null
    isLoading: boolean
}

export class WikiSelectComponent extends React.Component<Props, State> {

    private subscriptions: Subscription[] = [];

    constructor(props: Props) {
        super(props);

        this.onRandomizeTapped = this.onRandomizeTapped.bind(this);
        this.onChooseArticleTapped = this.onChooseArticleTapped.bind(this);
        this.state = {
            wikiArticle: null,
            isLoading: false
        }
    }

    componentDidMount() {
        this.subscriptions.push(
            Injector.instance().wikiService.article
                .pipe(
                    filter(article => article !== null)
                ).subscribe(wikiArticle => {
                    this.setState({ wikiArticle })
                })
        );
    }

    componentWillUnmount() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    onRandomizeTapped() {
        this.setState({ isLoading: true});
        Injector.instance().wikiService.fetchArticle().catch(() => {
            Injector.instance().errorService.pushError("Couldn't find an article", { message: "Check yo internet"})
        }).finally(() => {
            this.setState({ isLoading: false})
        })
    }

    onChooseArticleTapped() {
        this.props.close(this.state.wikiArticle)
    }

    render() {
        return <div className="wiki-container">
            <div className="wiki-header">
                <div className="wiki-buttons">
                    <button onClick={this.onRandomizeTapped}>Randomize</button>

                    {
                        this.state.wikiArticle &&
                        <button onClick={this.onChooseArticleTapped}>Choose this one!</button>
                    }
                </div>

                <div className="loading-container">
                {
                    this.state.isLoading &&
                    <div className="lds-ripple"><div></div><div></div></div>
                }
                </div>
            </div>


            {
                this.state.wikiArticle && this.state.wikiArticle.url &&
                <iframe title="wiki-iframe" src={this.state.wikiArticle.url}/>
            }
        </div>


    }
}