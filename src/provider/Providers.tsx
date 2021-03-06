import React, { FC } from 'react'
import { ApolloProvider } from '@apollo/react-hooks';
import { createClient } from '../apollo/client';
import { userContext, useUser } from '../context/UserContext';

export const Providers: FC = ({ children }) => {
  const context = useUser();
  const client = createClient()

  return (
    <userContext.Provider value={context}>
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </userContext.Provider>
  )
}