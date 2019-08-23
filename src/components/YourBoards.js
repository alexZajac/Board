import React, { Component } from "react";
import firebase from "firebase";
import "./YourBoards.css";
import { Redirect } from "react-router-dom";
import Fuse from "fuse.js";
import _ from "underscore";
import LoaderBoard from "./LoaderBoard";

const userId = localStorage.getItem("userId");
const boardsRef = firebase.database().ref("/boards/");
const sharedBoardsRef = firebase
  .database()
  .ref("/users/" + userId + "/savedBoards");
const gradientClasses = [
  "red",
  "green",
  "blue",
  "yellow",
  "orange",
  "pink",
  "lightblue",
  "gray"
];
const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value
});
const RandomGradients = ["#00f260", "#00dbde", "#f12711", "#fc00ff", "#ff6a00"];

export default class YourBoards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      numberOfBoards: 0,
      topColor: RandomGradients[0],
      ListOfBoards: [],
      searchValue: "",
      isLoading: true
    };
    this.createBoard = this.createBoard.bind(this);
    this.UpdateBoards = this.UpdateBoards.bind(this);
    this.selectRightPicture = this.selectRightPicture.bind(this);
    this.reorderListOfBoards = this.reorderListOfBoards.bind(this);
    this.orderBoardsByRecent = this.orderBoardsByRecent.bind(this);
    this.changeTopColor = this.changeTopColor.bind(this);
    this.orderBoardsByShared = this.orderBoardsByShared.bind(this);
    this.pathRedirect = null;
  }

  componentWillMount() {
    this.UpdateBoards();
  }

  orderBoardsByShared() {
    let Boards = this.state.ListOfBoards;
    let sharedBoards = [];
    Boards.forEach(board => {
      if (board.shared === "shared.png") sharedBoards.push(board);
    });
    this.setState({ ListOfBoards: _.union(sharedBoards, Boards) });
  }

  orderBoardsByRecent() {
    let Ids = [];
    let Boards = this.state.ListOfBoards;
    firebase
      .database()
      .ref("/users/" + userId + "/lastEdit")
      .once("value", snapshot => {
        snapshot.forEach(child => {
          Ids.push(child.val());
        });
        if (Ids === []) return;
        else {
          let recentBoards = _.sortBy(Boards, board => {
            return _.indexOf(Ids, board.id); //sort by Id regarding the lastEdited Ids array
          });
          this.setState({ ListOfBoards: recentBoards.reverse() });
        }
      });
  }

  reorderListOfBoards(searchValue) {
    let Boards = this.state.ListOfBoards;
    let optionsforSearch = {
      shouldSort: true,
      threshold: 0.6,
      findAllMatches: true,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ["title"]
    };
    if (searchValue === "recent") {
      this.orderBoardsByRecent();
    } else if (searchValue === "shared") {
      this.orderBoardsByShared();
    } else {
      const fuse = new Fuse(Boards, optionsforSearch);
      this.setState({
        ListOfBoards: _.union(fuse.search(searchValue), Boards)
      }); //return the search plus the Boards, less the duplicates
    }
  }

  selectRightPicture(boardId, t2 = 20, t3 = 100) {
    let res = 0;
    boardsRef
      .child(boardId)
      .child("notes")
      .once("value", snapshot => {
        const notes = snapshot.numChildren() || 0;
        if (notes <= t2) res = "littleNotes.png";
        else if (notes > t2 && notes <= t3) res = "middleNotes.png";
        else if (notes > t3) res = "lotNotes.png";
      });
    return res;
  }

  changeTopColor() {
    this.setState({ topColor: RandomGradients[Math.floor(Math.random() * 5)] });
  }

  UpdateBoards() {
    let sharedBoards = [];

    sharedBoardsRef.once("value", snap => {
      snap.forEach(boardSaved => {
        sharedBoards.push(boardSaved.val()); // get all shared boards of the user
      });
      boardsRef.on("child_added", snapshot => {
        const previousBoards = this.state.ListOfBoards;
        if (snapshot.val().creator === userId) {
          firebase
            .database()
            .ref("users/" + snapshot.val().creator + "/username")
            .once("value", user => {
              previousBoards.push({
                id: snapshot.key,
                title: snapshot.val().title,
                color: snapshot.val().color,
                mode: snapshot.val().mode,
                grid: snapshot.val().grid,
                creator: user.val(),
                numberPeopleOnBoard: snapshot.val().numberPeopleOnBoard,
                shared: "nullImg.png"
              });

              this.setState(
                {
                  ListOfBoards: previousBoards,
                  numberOfBoards: previousBoards.length,
                  isLoading: false
                },
                () => {
                  const elm = document.getElementById("scrollable");
                  setTimeout(
                    () =>
                      elm.scrollTo({
                        left: elm.scrollWidth,
                        behavior: "smooth"
                      }),
                    500
                  );
                }
              );
            });
        } else if (sharedBoards.includes(snapshot.key)) {
          firebase
            .database()
            .ref("users/" + snapshot.val().creator + "/username")
            .once("value", user => {
              previousBoards.push({
                id: snapshot.key,
                title: snapshot.val().title,
                color: snapshot.val().color,
                mode: snapshot.val().mode,
                grid: snapshot.val().grid,
                creator: user.val(),
                numberPeopleOnBoard: snapshot.val().numberPeopleOnBoard,
                shared: "shared.png"
              });
              this.setState({
                ListOfBoards: previousBoards,
                numberOfBoards: previousBoards.length,
                isLoading: false
              });
            });
        }
      });
      this.setState({ isLoading: false });
    });
  }

  createBoard() {
    boardsRef.push({
      title: "Click me to edit !",
      creator: userId,
      allowed: userId,
      notes: {},
      color: gradientClasses[Math.floor(Math.random() * 8)],
      mode: "Public",
      numberPeopleOnBoard: 1,
      grid: {}
    });
  }

  deleteBoard(boardId) {
    boardsRef.child(boardId).remove();
    let boards = [];
    boardsRef.once("value", snapshot => {
      if (snapshot.val() !== null) {
        snapshot.forEach(item => {
          let boardObject = {
            id: item.key,
            title: item.val().title,
            color: item.val().color,
            mode: item.val().mode,
            grid: item.val().grid
          };
          boards.push(boardObject);
        });
        this.setState({ ListOfBoards: boards });
      }
    });
  }

  redirectToBoard(id) {
    localStorage.setItem("boardId", id);
    if (localStorage.getItem("firstConnection_" + id) === null) {
      localStorage.setItem("firstConnection_" + id, true);
    }
    this.pathRedirect = "/board/" + id;
    this.setState({ redirect: true });
  }

  render() {
    const searchValue = this.state.searchValue;
    const numberOfBoards = this.state.numberOfBoards;
    const redirect = this.state.redirect;
    const topColor = { backgroundColor: this.state.topColor };
    const isLoading = this.state.isLoading;

    const ListOfBoards = this.state.ListOfBoards.map(board => (
      <div
        key={board.id}
        id="boardLayout"
        onClick={() => this.redirectToBoard(board.id)}
      >
        <div id="board-title">{board.title}</div>
        <img
          alt="Notes on the Board"
          id="boardRepresentation"
          src={require("./Images/" + this.selectRightPicture(board.id))}
        />
        <div id="infoBoard">
          <div id="creatorName">Created by {board.creator}</div>
          <div id="peopleOnBoard">
            People on board : {board.numberPeopleOnBoard}
          </div>
        </div>
        <img
          id="sharedImage"
          title="Shared Board"
          alt="Shared Board"
          src={require("./Images/" + board.shared)}
        />
      </div>
    ));

    if (redirect) {
      return <Redirect to={this.pathRedirect} />;
    }

    return (
      <div id="DashboardContainer">
        <div className="TemplateBoard">
          <div className="wrapper-topTemplateBoard myBoards" style={topColor}>
            <h1 id="yourBoards">My Boards</h1>
            <div id="numberOfBoards">
              You currently have {numberOfBoards} boards
            </div>
            <br />
            <button id="createButton" onClick={this.createBoard}>
              +
            </button>
            <div id="secretColor" onClick={this.changeTopColor} />
            <input
              type="search"
              onChange={e => {
                this.reorderListOfBoards(e.target.value);
                this.setState(byPropKey("searchValue", e.target.value));
              }}
              value={searchValue}
              placeholder="Search Boards..."
              onClick={e => e.target.select()}
              id="autoSearch"
            />
          </div>
          <div className="listOfBoards-wrapper" id="scrollable">
            {isLoading ? <LoaderBoard /> : ListOfBoards}
          </div>
        </div>
      </div>
    );
  }
}
