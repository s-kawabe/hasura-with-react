import { ApolloClient, InMemoryCache } from 'apollo-boost'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'

const cache = new InMemoryCache();
const HASURA_URL = process.env.REACT_APP_HASURA_URL;
const ADMIN_SECRET = process.env.REACT_APP_HASURA_ADMIN;

const headersLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      Authorization: `Bearer ${ADMIN_SECRET}`
    }
  })
  return forward(operation)
})

const httpLinnk = new HttpLink({ uri: HASURA_URL })

const link = ApolloLink.from([headersLink, httpLinnk])

export const client = new ApolloClient({
  cache: cache,
  link: link
  // link: headersLink,
})