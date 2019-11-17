import React from "react";
import "./CreateJoinGame.css"

interface State {
    gameName: string
    nameValid: boolean
}

export class CreateJoinGameComponent extends React.Component<any, State> {

    constructor(props: any) {
        super(props);

        this.onNameChanged = this.onNameChanged.bind(this);

        this.state = {
            gameName: '',
            nameValid: false
        }
    }

    private onJoin() {
        console.log("On join")
    }

    private onCreate() {
        console.log("On create")
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
                    <button onClick={this.onJoin}>Join Game</button>
                    <button onClick={this.onCreate}>Create Game</button>
                </div>
            }


        </div>
    }
}