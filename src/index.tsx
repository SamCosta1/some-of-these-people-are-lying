import React from 'react';
import ReactDOM from 'react-dom';
import './ui/styles/index.scss';
import './ui/styles/spinner.scss';
import App from './ui/app/App';
import * as serviceWorker from './serviceWorker';
import initFirebase from "./build/initFirebase";
import Injector from "./service/Injector";

initFirebase();
Injector.initializeInjector()

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
