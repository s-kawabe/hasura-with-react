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

  firebase.auth().onAuthStateChanged(async (user) => {
    if(user) {
      const token = await user.getIdToken()
      setIdToken(token)
      console.log(token)
    }
  })

  // const fetchUsers = () => {
  //   fetch(endpoint, {
  //     method: 'POST',
  //     headers: { Authorization: `Bearer ${idToken}` },
  //     body: JSON.stringify(query),
  //   }).then(res => [
  //     res.json().then(result => {
  //         console.log(result)
  //       })
  //   ])
  // }
  const fetchUsers = async (): Promise<void> => {
    try {
      // fetchじゃなくuseQueryつかう！
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(query)
      })
      const result = await res.json()
      console.log(result);
    } catch(error) {
      console.error(error);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="flex">
          <span>HASURA</span>
          <img src={logo} className="App-logo" alt="logo" />
          <span>TODO</span>
        </div>
        <div>
          <button onClick={login} className="button">
            LOGIN
          </button>
          <button onClick={logout} className="button">
            LOGOUT
          </button>
          <button onClick={fetchUsers} disabled={!idToken.length} className="button">
            GET USER
          </button>
        </div>
      </header>
    </div>
  )
}

export default App;
