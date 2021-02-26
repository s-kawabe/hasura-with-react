import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const queryStr = 'query MyQuery { users { id name } }'
  const query = { query: queryStr }
  const endpoint = 'https://hasura-tutorial20210222.herokuapp.com/v1/graphql'

  const fetchUsers = () => {
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(query),
    }).then(res => [
      res.json()
        .then(result => {
          console.log(result)
        })
    ])
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <button onClick={fetchUsers}>GET USER</button>
        </div>
      </header>
    </div>
  )
}

export default App;
