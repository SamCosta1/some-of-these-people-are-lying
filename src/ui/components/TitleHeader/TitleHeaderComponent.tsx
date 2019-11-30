import React from 'react';
import Injector from '../../../service/Injector';
import {Subscription} from 'rxjs/internal/Subscription';
import {GameMetaData} from '../../../service/models/GameMetaData';
import "./TitleHeader.scss"
import {map} from 'rxjs/operators';
import {Article} from "../../../service/models/Article";

interface State {
    titlePrefix: string,
    gameName: string,
}
export class TitleHeaderComponent extends React.Component<any, State> {

    subscriptions: Subscription[] = [];

    constructor(props: any) {
        super(props);

        this.state = {
            titlePrefix: 'Some',
            gameName: ''
        };

        this.leaveGame = this.leaveGame.bind(this);
    }

    private async leaveGame() {
        try {
            await Injector.instance().gameService.leaveGame();
            window.location.reload();
        } catch (e) {
            Injector.instance().errorService.pushError("Failed to leave game", e);
        }
    }

    componentDidMount() {
        const metaSub = Injector.instance().gameService
            .currentGameMeta
            .subscribe((gameMeta: GameMetaData) => this.setState({ gameName: gameMeta.name }));

        const articlesSub = Injector.instance().gameService
            .articlesMinusGuessers
            .pipe(
                map((articles: Article[]) => articles.length - 1),
                map(numLiars => {
                    if (numLiars <= 1) return 'Some';
                    if (numLiars === 2) return 'Two';
                    if (numLiars === 3) return 'Three';
                    if (numLiars === 4) return 'Four';
                    if (numLiars === 5) return 'Five';
                    if (numLiars === 6) return 'Six';
                    return 'Many';
                })
            ).subscribe(titlePrefix => this.setState({ titlePrefix }));

        this.subscriptions.push(metaSub, articlesSub);
    }

    componentWillUnmount() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    render() {
        return <div>
            <div className="leave-game" onClick={this.leaveGame}>Leave this game</div>
            <div className="title-game-name">{this.state.gameName}</div>
            <h1>{this.state.titlePrefix} of these people are lying</h1>
        </div>
    }
}