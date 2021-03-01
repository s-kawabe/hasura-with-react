import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import axios from 'axios'

admin.initializeApp(functions.config().firebase);

const createUser = `
mutation createUser($id: String = "", $name: String = "") {
  insert_users(objects: [{id: $id, name: $name}]) {
    affected_rows
  }
}
`

// firebaseのユーザ作成時のイベントハンドラ
export const processSignUp = functions.auth.user().onCreate(async (user) => {
  try {
    let customClaims = {
      "https://hasura.io/jwt/claims": {
        "x-hasura-default-role": "user",
        "x-hasura-allowed-roles": ["user"],
        "x-hasura-user-id": user.uid
      }
    }
    // setCustomUserClaims(uid: string, customUserClaims: object | null): Promise<void>
    await admin.auth().setCustomUserClaims(user.uid, customClaims)

    let queryStr = {
      "query": createUser,
      "variables": {id: user.uid, name: user.displayName}
    }

    axios({
      method: 'post',
      url: functions.config().hasura.admin.hasura.url,
      data: queryStr,
      headers: {
        'x-hasura-admin-secret': functions.config().hasura.admin_secret
      }
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