import { ApolloClient, InMemoryCache } from 'apollo-boost'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import React, { useState, useContext } from 'react';
import { GlobalState, GlobalStateType } from '../index';
import { ApolloProvider } from '@apollo/react-hooks';
import type { NormalizedCacheObject } from '@apollo/client'

const cache = new InMemoryCache();
const HASURA_URL = process.env.REACT_APP_HASURA_URL;
// const ADMIN_SECRET = process.env.REACT_APP_HASURA_ADMIN;

export const Client = ({children}: any) => {
  // 多分ここはカスタムフックにしたほうがいい？→ InMemoryCacheでできないか
  const [user, setUser] = useState<GlobalStateType>({ user: null})
  setUser(useContext(GlobalState));

  const headersLink = new ApolloLink((operation, forward) => {  
    operation.setContext({
      headers: {
        Authorization: user.user ? `Bearer ${user.user.getIdToken()}` : ''
      }
    })
    return forward(operation)
  })
  
  const httpLinnk = new HttpLink({ uri: HASURA_URL })
  const link = ApolloLink.from([headersLink, httpLinnk])
  
  const createClient = (user: GlobalStateType): ApolloClient<NormalizedCacheObject> => {
    return new ApolloClient({
      cache: cache,
      link: link
    })
  }

  return (
    <ApolloProvider client={createClient}>
      {children}
    </ApolloProvider>
  )
}