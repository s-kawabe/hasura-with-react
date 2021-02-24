# HasuraとFirebase Authで認証付きToDoアプリをつくる

[公式チュートリアル参考](https://hasura.io/learn/ja/graphql/hasura/authentication/1-create-auth0-app/)
→公式はAuth0だが firebase authenticationでやってみる

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