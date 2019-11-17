import React from 'react';
import './App.css';
import Injector from "../service/Injector";


class App extends React.Component {

  numPlayers: number = -1;

  componentDidMount() {
      Injector.instance().authService.authState.subscribe()
  }

  render() {
      return (
        <div className="App">
          <header className="App-header">
            <h1>{this.numPlayers < 1 ? "Some" : this.numPlayers} of these people are lying!</h1>
          </header>
        </div>
      );
    }
}

export default App;
