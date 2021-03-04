import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import firebase from './firebase/firebaseConfig'
import { Client } from './apollo/Client';

export type GlobalStateType = {
  user: firebase.User | null
}

const initialValue = {
  user: null
}

export const GlobalState = React.createContext<GlobalStateType>(initialValue)

ReactDOM.render(
  <GlobalState.Provider value={initialValue}>
    <Client>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Client>
  </GlobalState.Provider>,
  document.getElementById('root')
);

