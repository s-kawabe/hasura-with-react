import React,{ useState } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from './firebase/firebaseConfig';
import { SELECT_ALL_USERS } from './apollo/query'
import { useQuery } from '@apollo/react-hooks'
import { useReactiveVar } from '@apollo/client'
import { Button, useToast } from '@chakra-ui/react'
import { TodoList } from './components/TodoList'
import { loginUserVar } from './apollo/cache'

export type Data = {
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
  const toast = useToast()
  let loginUser = useReactiveVar(loginUserVar)
  
  const selectAllUsers = useQuery(SELECT_ALL_USERS)

  const login = async () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    await firebase.auth().signInWithPopup(provider)
    successToast('success loined.')
  }

  const logout = () => {
    firebase.auth().signOut()
    setIdToken('')
    setName('')
    setData(initialData) // ここら辺めっちゃ再レンダリングされちゃいそう
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loginUser = []
    successToast('success logouted.')
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if(user) {
      const token = await user.getIdToken()
      setIdToken(token)
      setName(user.displayName || 'unknown user')
      // context.setAuthUser(user) // contextでやってたとき
      // ここでApolloのuserのstateを更新すればApolloProviderがもう１回走るのでは
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      loginUser = [user]
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

  const successToast = (title: string) => {
    return toast({
      position: "top-right",
      title: title,
      status: 'success',
      duration: 5000,
      isClosable: true
    })
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
          <Button onClick={() => {login()}} bgColor="teal.500" mr="2" >
            LOGIN
          </Button>
          <Button onClick={() => {logout()}} bgColor="teal.500" mr="2">
            LOGOUT
          </Button>
          <Button onClick={() => {fetchUsers(selectAllUsers)}} disabled={!idToken.length} bgColor="teal.500">
            GET USERS
          </Button>
          {/* <Button size="xs" color="teal">
            aaaaa
          </Button> */}
        </div>
        <div className="message">
          {name 
            ? <div>logined by <span className="bold">{name}</span></div>
            : 'Please Login'}
        </div>
        {data.users.length !== 0 
          ? <TodoList data={data}/>
          : ''
        }
      </header>
    </div>
  )
}

export default App;
