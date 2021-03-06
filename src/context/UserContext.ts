import { createContext, useState, useCallback } from 'react'
import firebase from '../firebase/firebaseConfig'

type UserContext = {
  user: firebase.User | null;
  setAuthUser: (user: firebase.User) => void;
};

// context default value
const defaultContext: UserContext = {
  user: null,
  setAuthUser: () => {}
}

// context object
export const userContext = createContext<UserContext>(defaultContext)

// custome Hook(子コンポーネントから変更可能にする)
export const useUser = (): UserContext => {
  const [user, setUser] = useState<firebase.User | null>(null)

  const setAuthUser = useCallback((current: firebase.User): void => {
    setUser(current);
  }, []);

  return {
    user,
    setAuthUser
  }
}

