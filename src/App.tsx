import React,{ useState, useContext } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from './firebase/firebaseConfig';
import { SELECT_ALL_USERS } from './apollo/query'
import { useQuery } from '@apollo/react-hooks'
import { userContext } from './context/UserContext';

// type User = {
//   id: string
//   name: string
// }

function App() {
  const [idToken, setIdToken] = useState('')
  const [result, setResult] = useState('')
  // const [variable, setVariable] = useState<string>('') 

  const context = useContext(userContext)
  const selectAllUsers = useQuery(SELECT_ALL_USERS)

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
      context.setAuthUser(user)
    }
  })

  const fetchUsers = ({ loading, error, data }: any) => {
    try {
      if (loading) setResult('loading...')
      if (error) setResult(`${error}`)
      if (data) {
        setResult(`${data}`)
        console.log(data)
      }
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
          <button onClick={() => {fetchUsers(selectAllUsers)}} disabled={!idToken.length} className="button">
            GET USER
          </button>
        </div>
        <div>
          <p>{result}</p>
        </div>
      </header>
    </div>
  )
}

export default App;
