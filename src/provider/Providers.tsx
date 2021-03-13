import React, { FC } from 'react'
import { ApolloProvider } from '@apollo/react-hooks';
import { createClient } from '../apollo/client';
import { ChakraProvider } from '@chakra-ui/react';

export const Providers: FC = ({ children }) => {
  const client = createClient()

  return (
    <ApolloProvider client={client}>
      <ChakraProvider>
        {children}
      </ChakraProvider>
    </ApolloProvider>
  )
}