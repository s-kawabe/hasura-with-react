import { ApolloClient, InMemoryCache } from '@apollo/client'
import { createHttpLink } from '@apollo/client'
import firebase from '../firebase/firebaseConfig'
import { setContext } from '@apollo/client/link/context' 

const cache = new InMemoryCache();
const HASURA_URL = process.env.REACT_APP_HASURA_URL;

const httpLinnk = createHttpLink({ uri: HASURA_URL })

export const createClient = () => {

  const authLink = setContext(async (_, { headers }) => {
    const token = await firebase.auth().currentUser?.getIdToken(true)
    console.log(token)
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : ''
      }
    }
  })

  return new ApolloClient({
    link: typeof window === "undefined" ? httpLinnk : authLink.concat(httpLinnk),
    cache: cache
  })
}
