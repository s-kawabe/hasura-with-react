import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
const axios = require('axios')

admin.initializeApp(functions.config().firebase);

const createUser = `
mutation createUser($id: String = "", $name: String = "") {
  insert_users(objects: [{id: $id, name: $name}]) {
    affected_rows
  }
}
`

// firebaseのユーザ作成時のイベントハンドラ
exports.processSignUp = functions.auth.user().onCreate(user => {
  let customClaims = {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user'],
      'x-hasura-user-id': user.uid
    }
  }

  // setCustomUserClaims(uid: string, customUserClaims: object | null): Promise<void>
  return admin.auth().setCustomUserClaims(user.uid, customClaims)
    .then(() => {
      let queryStr = {
        "query": createUser,
        "variables": {id: user.uid, name: "tarou"}
      }

      axios({
        method: 'post',
        url: 'https://hasura-tutorial20210222.herokuapp.com/v1/graphql',
        data: queryStr,
        headers: {
          'x-hasura-admin-secret': process.env.REACT_APP_HASURA_ADMIN
        }
      })

      admin
      .firestore()
      .collection("user_meta")
      .doc(user.uid)
      .create({
        refreshTime: admin.firestore.FieldValue.serverTimestamp()
      });
    })
    .catch(error => {
      console.error(error)
    })
    
})