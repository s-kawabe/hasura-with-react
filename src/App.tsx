import React,{ useState, useContext } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from './firebase/firebaseConfig';
import { SELECT_ALL_USERS } from './apollo/query'
import { useQuery } from '@apollo/react-hooks'
import { userContext } from './context/UserContext';

type Data = {
  users: {
    __typename: string,
    id: string 
    name: string
  }[]
}

const initialData = {
  users: []
}

function App() {
  const [idToken, setIdToken] = useState('')
  const [name, setName] = useState('')
  const [data, setData] = useState<Data>(initialData)
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
      setName(user.displayName || 'unknown user')
      context.setAuthUser(user)
    }
  })

  const fetchUsers = ({ loading, error, data }: any) => {
    try {
      if (loading) console.log(loading)
      if (error) console.log(error)
      if (data) {
        setData(data)
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
            GET USERS
          </button>
        </div>
        <p className="message">
          {name 
            ? <div>logined by <span className="bold">{name}</span></div>
            : 'Please Login'}
        </p>
        {data.users.length !== 0 
          ? <table>
            <thead>
              <th>id</th>
              <th>name</th>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <div key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                </div>
              ))}
            </tbody>
          </table>
          : ''
        }
      </header>
    </div>
  )
}

export default App;
