import { InMemoryCache, ReactiveVar, makeVar } from '@apollo/client';
import firebase from '../firebase/firebaseConfig'

// ログイン中のuserはReactive変数 userの一覧はInMemoryCacheに持たせたい
type LoginUser = firebase.User

export const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        loginUser: {
          read () {
            return loginUserVar();
          }
        }
      }
    }
  }
})

const loginUserInitialValue: LoginUser[] = []

export const loginUserVar: ReactiveVar<LoginUser[]> = makeVar<LoginUser[]>(
  loginUserInitialValue
)