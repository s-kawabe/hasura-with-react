import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { gql, ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import fetch from 'node-fetch'


admin.initializeApp(functions.config().firebase);

const mutation = gql`
mutation InsertUsers($id: String, $name: String) {
  insert_users(objects: { id: $id, name: $name }) {
    returning {
      id
      name
      created_at
    }
  }
}
`

const httpLink = createHttpLink({ 
  uri: functions.config().hasura.url, 
  fetch: fetch as any 
})
const authLink = setContext(async (_, { headers }) => {
  return {
    headers: {
      ...headers,
      'x-hasura-admin-secret': functions.config().hasura.admin_secret
    }
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

// firebaseのユーザ作成時のイベントハンドラ
export const processSignUp = functions.auth.user().onCreate(async (user) => {
  let customClaims = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": "user",
      "x-hasura-allowed-roles": ["user"],
      "x-hasura-user-id": user.uid
    }
  }
  
  try {
    // setCustomUserClaims(uid: string, customUserClaims: object | null): Promise<void>
    await admin.auth().setCustomUserClaims(user.uid, customClaims)

    await client.mutate({
      variables: { id: user.uid, name: user.displayName || "unknown" },
      mutation
    })

    admin
      .firestore()
      .collection("user_meta")
      .doc(user.uid)
      .create({
        refreshTime: admin.firestore.FieldValue.serverTimestamp()
      });
  }
  catch(error) {
    console.error(error);
  }
})