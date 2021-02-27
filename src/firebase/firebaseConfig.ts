import firebase from "firebase/app"
import 'firebase/auth'

firebase.initializeApp({
  apiKey: "AIzaSyDjMSRp8hv-0Ujcwx94yVI21GOJ7B80XPA",
  authDomain: "hasura-tutorial-8cb6e.firebaseapp.com",
  projectId: "hasura-tutorial-8cb6e",
  storageBucket: "hasura-tutorial-8cb6e.appspot.com",
  messagingSenderId: "148208353350",
  appId: "1:148208353350:web:930b7c05b0b4eb22f10a47",
  measurementId: "G-JTMKDRF427"
})

export const auth = firebase.auth()