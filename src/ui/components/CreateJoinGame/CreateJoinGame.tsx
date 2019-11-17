import React from "react";
import "./CreateJoinGame.css"
import Injector from "../../../service/Injector";

interface State {
    gameName: string
    nameValid: boolean
}

export class CreateJoinGameComponent extends React.Component<any, State> {

    constructor(props: any) {
        super(props);

        this.onNameChanged = this.onNameChanged.bind(this);
        this.onJoinTapped = this.onJoinTapped.bind(this);
        this.onCreateTapped = this.onCreateTapped.bind(this);

        this.state = {
            gameName: '',
            nameValid: false
        }
    }

    private onJoinTapped() {
        const b =Injector.instance().gameService.joinGame(this.state.gameName)
    }

    private onCreateTapped() {
        const b =Injector.instance().gameService.createGame(this.state.gameName)

    }

    private onNameChanged(e: any) {
        const newName: string = e.target.value;

        this.setState({
            gameName: newName,
            nameValid: newName.trim().length > 2
        });
    }

    render() {
        return <div>
            <input className="group-name-input" placeholder="Name of your group's game" type="text" value={this.state.gameName} onChange={this.onNameChanged} />

            {
                this.state.nameValid &&
                <div>
                    <button onClick={this.onJoinTapped}>Join Game</button>
                    <button onClick={this.onCreateTapped}>Create Game</button>
                </div>
            }


        </div>
    }
}