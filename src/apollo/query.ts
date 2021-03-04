import { gql } from '@apollo/client'

export const CREATE_USER = gql`
mutation createUser($id: String = "", $name: String = "") {
  insert_users(objects: [{id: $id, name: $name}]) {
    affected_rows
  }
}
`

export const SELECT_ALL_USERS = gql`
query selectAllUsers { 
  users { 
    id name 
  } 
}
`

export const SELECT_USER = gql`
query selectUser($name: String) { 
  users(where: {name: {_eq: $name}}) { 
    id 
    name 
  } 
}
`