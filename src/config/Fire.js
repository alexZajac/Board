import firebase from "firebase/app";
// require("c:/Users/Alexandre Zajac/Desktop/Programmation/Training/light-board/Board/src/config/firebase/auth");
// require("c:/Users/Alexandre Zajac/Desktop/Programmation/Training/light-board/Board/src/config/firebase/database");
// require("c:/Users/Alexandre Zajac/Desktop/Programmation/Training/light-board/Board/src/config/firebase/firestore");
// require("c:/Users/Alexandre Zajac/Desktop/Programmation/Training/light-board/Board/src/config/firebase/messaging");
// require("c:/Users/Alexandre Zajac/Desktop/Programmation/Training/light-board/Board/src/config/firebase/functions");

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
