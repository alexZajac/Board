import firebase from "firebase";
require("c:/Users/Alexandre Zajac/Desktop/Programmation/Training/light-board/node_modules/firebase/auth");
require("c:/Users/Alexandre Zajac/Desktop/Programmation/Training/light-board/node_modules/firebase/database");
require("c:/Users/Alexandre Zajac/Desktop/Programmation/Training/light-board/node_modules/firebase/firestore");
require("c:/Users/Alexandre Zajac/Desktop/Programmation/Training/light-board/node_modules/firebase/messaging");
require("c:/Users/Alexandre Zajac/Desktop/Programmation/Training/light-board/node_modules/firebase/functions");
  
const config = {
    apiKey: "AIzaSyCVL87EmQynN63le9Dc6yPxL1E4KT5DgPw",
    authDomain: "boarder-5469b.firebaseapp.com",
    databaseURL: "https://boarder-5469b.firebaseio.com",
    projectId: "boarder-5469b",
    storageBucket: "boarder-5469b.appspot.com",
    messagingSenderId: "838925486048"
  };

const fire = firebase.initializeApp(config);
export default fire;