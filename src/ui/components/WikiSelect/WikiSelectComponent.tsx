import React from "react";
import "./WikiSelect.scss"
import Injector from "../../../service/Injector";
import {WikiArticle} from "../../../service/models/Wiki";

interface State {
    wikiArticle: WikiArticle | null
    isLoading: boolean
}

export class WikiSelectComponent extends React.Component<any, State> {

    constructor(props: any) {
        super(props);

        this.onRandomizeTapped = this.onRandomizeTapped.bind(this);
        this.state = {
            wikiArticle: null,
            isLoading: false
        }
    }

    onRandomizeTapped() {
        this.setState({ isLoading: true})
        Injector.instance().wikiService.fetchArticle().then(wikiArticle => {
            this.setState({ wikiArticle })
        }).catch(() => {
            Injector.instance().errorService.pushError("Couldn't find an article", { message: "Check yo internet"})
        }).finally(() => {
            this.setState({ isLoading: false})
        })
    }

    render() {
        return <div className="wiki-container">
            <div className="wiki-header">
                <button onClick={this.onRandomizeTapped}>Randomize</button>
                <button>Choose this one!</button>
            </div>

            {
                this.state.isLoading &&
                    <div className="loading-container">
                        <div className="lds-ripple"><div></div><div></div></div>
                    </div>
            }


            {
                this.state.wikiArticle && this.state.wikiArticle.url &&
                <iframe title="wiki-iframe" src={this.state.wikiArticle.url}/>
            }
        </div>


    }
}