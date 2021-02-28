import React,{ useState } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from './firebase/firebaseConfig';

function App() {
  const [idToken, setIdToken] = useState<string>('')
  const queryStr = 'query MyQuery { users { id name } }'
  const query = { query: queryStr }
  const endpoint = 'https://hasura-tutorial20210222.herokuapp.com/v1/graphql'

  const login = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider)
  }

  const logout = () => {
    firebase.auth().signOut()
    setIdToken('')
  }

  firebase.auth().onAuthStateChanged(user => {
    if(user) {
      user.getIdToken().then(token => {
        setIdToken(token)
        console.log(token)
      })
    }
  })

  const fetchUsers = () => {
    fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(query),
    }).then(res => [
      res.json().then(result => {
          console.log(result)
        })
    ])
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <button onClick={login}>
            LOGIN
          </button>
          <button onClick={logout}>
            LOGOUT
          </button>
          <button onClick={fetchUsers} disabled={!idToken.length}>
            GET USER
          </button>
        </div>
      </header>
    </div>
  )
}

export default App;
