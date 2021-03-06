# HasuraとFirebase Authで認証付きToDoアプリをつくる

[公式チュートリアル参考](https://hasura.io/learn/ja/graphql/hasura/authentication/1-create-auth0-app/)
→公式はAuth0だが firebase authenticationでやってみる

## memo

### firebase functions上の環境変数　設定/参照
**設定**<br>

```
firebase functions:config:set hasura.apikey="***********"
```

**参照**<br>

```
firebase functions:config:get
```

## Hasura上に適当にテーブルをつくってfetchしてみる

```tsx
import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const queryStr = 'query MyQuery { users { id name } }'
  const query = { query: queryStr }
  const endpoint = 'https://hasura-tutorial20210222.herokuapp.com/v1/graphql'

  const fetchUsers = () => {
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(query)
    }).then(res => [
      res.json()
        .then(result => {
          console.log(result)
        })
    ])
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <button onClick={fetchUsers}>GET USER</button>
        </div>
      </header>
    </div>
  )
}

export default App;
```

これでとりあえずHasuraを動かしてレスポンスデータが返ってきた。<br>
これに認証機能をつけていく。

## 認証をつける

[参考にした](https://zenn.dev/yubachiri/articles/bb4ac475d7e3560c3913#%E8%AA%8D%E8%A8%BC%E8%A8%AD%E5%AE%9A)

<br><br>
エンドポイントをセキュアにするために、環境変数の設定をする必要があるが<br>
Herokuを使う場合は恐らく[これ](https://hasura.io/docs/latest/graphql/core/deployment/deployment-guides/heroku.html#heroku-secure)<br>
Herokuの環境変数に`HASURA_GRAPHQL_ADMIN_SECRET`を追加する。<br>
これで恐らくHasura Consoleアクセス時にadminシークレットキーを要求される。<br><br>

これで先ほどのコードはコンソールにエラーが出ているはず。<br>
APIリクエスト時はヘッダの`x-hasura-admin-secret`にそのシークレットキーを設定することで<br>
admin権限によるリクエストとなる。<br>
また、AuthorizationヘッダにJWTが設定されていればそれによる認証を行うようになる。<br><br>

[ここで](https://hasura.io/jwt-config/)firebaseのJWTの設定をする。<br>
生成されたjsonで、Herokuの環境変数に`JWT_SECRET`を追加する。<br>

### カスタムクレームの設定
Cloud Functionsで使う、Hasuraに対して「リクエストを行ったユーザの権限」を伝える<br>
FirebaseのCLIを入れて`firebase init`しておく。

[index.ts]
```tsx
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
export const processSignUp = functions.auth.user().onCreate(user => {
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
    })
    .catch(error => {
      console.error(error)
    })  
})
```

## コンポーネントからfirebaseにログインする(→functionsが作動する)

```tsx
import React,{ useState } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from './firebase/firebaseConfig';

function App() {
  const [idToken, setIdToken] = useState<string>('')
  const queryStr = 'query MyQuery { users { id name } }'
  const query = { query: queryStr }
  const endpoint = 'https://hasura-tutorial20210222.herokuapp.com/v1/graphql'

  const login = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider)
  }

  const logout = () => {
    firebase.auth().signOut()
    setIdToken('')
  }

  firebase.auth().onAuthStateChanged(user => {
    if(user) {
      user.getIdToken().then(token => {
        setIdToken(token)
        console.log(token)
      })
    }
  })

  const fetchUsers = () => {
    fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(query),
    }).then(res => [
      res.json().then(result => {
          console.log(result)
        })
    ])
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <button onClick={login}>
            LOGIN
          </button>
          <button onClick={logout}>
            LOGOUT
          </button>
          <button onClick={fetchUsers} disabled={!idToken.length}>
            GET USER
          </button>
        </div>
      </header>
    </div>
  )
}

export default App;

```

# エラー集
## funcsionsのデプロイに失敗する
### 403 Forbiddonエラー
```
firebase logout
```
をして
```
firebase login
```
をしたあとに再度実行で成功。

###  Functions did not deploy properly.
`index.ts`のどっかがおかしい。

axiosをプロジェクトrootのnode_modulesにインストールしてしまう<br>
→functionsのindex.tsでaxios使おうとする<br>
→firebase deployでエラー<br>
**firebase functions を使う時は`npm install`, `yarn add` をする<br>
ディレクトリに注意する！！**


### functionsのAPI叩くと「カスタムクレームがない」と言われる
たぶん以下の部分をシングルクォートにしていたのが原因

```ts
let customClaims = {
  "https://hasura.io/jwt/claims": {
    "x-hasura-default-role": "user",
    "x-hasura-allowed-roles": ["user"],
    "x-hasura-user-id": user.uid
  }
}
```

# インストール集
## functions以下

```
npm i @apollo/client graphql node-fetch @types/node-fetch 
```