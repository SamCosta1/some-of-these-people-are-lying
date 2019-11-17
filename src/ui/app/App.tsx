import React from 'react';
import './App.css';
import Injector from "../../service/Injector";
import {Subscription} from "rxjs/internal/Subscription";
import {LoggedIn, AuthError} from "../../service/models/AuthState";

interface AppState {
    isLoading: boolean,
    error: string
}
class App extends React.Component<any, AppState> {

  authStateSubscription?: Subscription;

  constructor(props: any) {
      super(props);

      this.state = {
          isLoading: false,
          error: ""
      }
  }

  componentDidMount() {
      this.authStateSubscription = Injector.instance().authService.authState
          .subscribe((state) => {
              this.setState({ isLoading: !(state instanceof LoggedIn) });

              if (state instanceof AuthError) {
                  this.setState({ error: state.message });
              }
          })

  }

  componentWillUnmount() {
     if (this.authStateSubscription) this.authStateSubscription.unsubscribe();
  }

  render() {
      return (
        <div className="App">
          <header className="App-header">
              <div className="error-container">{this.state.error}</div>
          </header>

            { this.state.isLoading ?
                <div className="loading-container">
                    <div className="lds-ripple"><div></div><div></div></div>
                </div>

                : null
            }
        </div>
          
      );
    }
}

export default App;
