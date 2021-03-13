import { ApolloClient } from '@apollo/client'
import { createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context' 
import { cache, loginUserVar } from './cache';

const HASURA_URL = process.env.REACT_APP_HASURA_URL;

const httpLinnk = createHttpLink({ uri: HASURA_URL }) 

export const createClient = () => {

  const authLink = setContext(async (_, { headers }) => {
    const [user] = loginUserVar()
    const token = await user?.getIdToken()
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : ''
      }
    }
  })

  return new ApolloClient({
    // link: typeof window === "undefined" ? httpLinnk : authLink.concat(httpLinnk),
    cache: cache,
    link: authLink.concat(httpLinnk)
  })
}
