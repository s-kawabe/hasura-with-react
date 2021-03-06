import { ApolloClient, InMemoryCache } from 'apollo-boost'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import type { NormalizedCacheObject } from '@apollo/client'
import firebase from '../firebase/firebaseConfig'

const cache = new InMemoryCache();
const HASURA_URL = process.env.REACT_APP_HASURA_URL;

// firebaseのsessionからuser情報を取得する
let user: any = null;

const httpLinnk = new HttpLink({ uri: HASURA_URL })

const headersLink = new ApolloLink((operation, forward) => {  
  operation.setContext({
    headers: {
      Authorization: user ? `Bearer ${user.getIdToken()}` : ''
    }
  })
  return forward(operation)
})

const link = ApolloLink.from([headersLink, httpLinnk])

export const createClient = (): ApolloClient<NormalizedCacheObject> => {
  user = firebase.auth().currentUser;
  console.log('ログイン中user:', user)
  return new ApolloClient({
    cache: cache,
    link: link
  })
}
