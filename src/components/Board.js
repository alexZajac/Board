import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import firebase from "firebase";
import "./Board.css";
import IncognitoMode from "./Incognito";
import SaveToMyBoards from "./SaveToMyBoards";
import ErrorPage from "../ErrorPage";
import Note from "./Note";
import LoaderBoard from "./LoaderBoard";
import { Responsive, WidthProvider } from "react-grid-layout";
import _ from "lodash";

import "./Note.css";
import "react-resizable/css/styles.css";
import "react-grid-layout/css/styles.css";
const userId = localStorage.getItem("userId");
const colorNotes = [
  "rgba(39,11,199,1) rgba(71,12,249,1)",
  "rgba(148,24,219,1) rgba(200,26,239,1)",
  "rgba(255,110,0,1) rgba(231,75,2,1)",
  "rgba(249,15,25,1) rgba(231,14,69,1)",
  "rgba(249,12,210,1) rgba(202,12,219,1)",
  "rgba(214,255,10,1) rgba(223,220,25,1)",
  "rgba(53,255,105,1) rgba(77,212,44,1)",
  "rgba(0,172,230,1) rgba(1, 186, 192,1)"
];

const Grid = WidthProvider(Responsive);

const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value
});

export default class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ListOfNotes: [],
      bgColor: "white",
      firstNoteId: "",
      boardName: "",
      mode: "Public",
      allowed: "",
      creator: "",
      numberOfPeople: "",
      boardExists: true,
      numberOfNotes: 0,
      redirect: "",
      items: [], //items and datagrid
      layout: [], //layout of items
      loading: true
    };
    this.createNote = this.createNote.bind(this);
    this.updateBoard = this.updateBoard.bind(this);
    this.boardMode = this.boardMode.bind(this);
    this.checkBoardExistence = this.checkBoardExistence.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.onBreakpointChange = this.onBreakpointChange.bind(this);
    this.numberOfPeople = null;
    this.creator = null;

    this.boardId = localStorage.getItem("boardId");
    this.boardRef = firebase.database().ref("/boards/" + this.boardId);
    this.notesRef = firebase
      .database()
      .ref("/boards/" + this.boardId + "/notes");
  }

  async componentDidMount() {
    await this.checkBoardExistence();
    await this.updateBoard();
    localStorage.setItem("redirectboardId", this.boardId);
    localStorage.setItem("boardId", this.boardId);
  }

  async checkBoardExistence() {
    const boardsArray = [];
    await firebase
      .database()
      .ref("boards")
      .once("value", snapshot => {
        snapshot.forEach(child => {
          boardsArray.push(child.key);
        });
        if (boardsArray === [] || !boardsArray.includes(this.boardId)) {
          this.setState({ boardExists: false });
        }
      });
  }

  async updateBoard() {
    //BOARD NAME
    firebase
      .database()
      .ref("/boards/" + this.boardId + "/title/")
      .on("value", snapshot => {
        this.setState(
          { boardName: snapshot.val() },
          localStorage.setItem("boardName", snapshot.val())
        );
      });

    //CREATOR
    await firebase
      .database()
      .ref("/boards/" + this.boardId + "/creator/")
      .once("value", snapshot => {
        this.setState({ creator: snapshot.val() });
      });

    //NBRPEOPLE
    firebase
      .database()
      .ref("/boards/" + this.boardId + "/numberPeopleOnBoard/")
      .on("value", snapshot => {
        this.setState({ numberOfPeople: snapshot.val() });
      });

    //ALLOWED
    firebase
      .database()
      .ref("/boards/" + this.boardId + "/allowed/")
      .on("value", snapshot => {
        if (snapshot.val())
          this.setState({ allowed: snapshot.val().split(" ") || [] });
      });

    //MODE
    firebase
      .database()
      .ref("/boards/" + this.boardId + "/mode")
      .on("value", snapshot => {
        this.setState({ mode: snapshot.val() });
      });

    //Redirect if board is deleted by creator
    firebase
      .database()
      .ref("boards")
      .on("child_removed", snapshot => {
        if (snapshot.key === this.boardId) {
          this.redirect("/dashboard");
        }
      });

    //Load Layouts
    await this.boardRef.child("layout").once("value", snapshot => {
      if (snapshot.val()) {
        const originalLayout = JSON.parse(snapshot.val());
        const savedLayout = originalLayout["layout"];
        console.log(savedLayout);
        this.setState({ items: savedLayout });
        //this.onLayoutChange(savedLayout);
      }
      this.setState({ loading: false });
    });

    //NOTES

    this.notesRef.on("child_added", snapshot => {
      let previousNotes = this.state.ListOfNotes;
      let previousItems = this.state.items;

      if (snapshot.val()) {
        previousNotes.push({
          id: snapshot.key,
          contents: snapshot.val().contents,
          creator: snapshot.val().creator,
          color: snapshot.val().color,
          upvotes: snapshot.val().upvotes,
          date: snapshot.val().date,
          isStatic: userId !== snapshot.val().creator,
          isEditable: userId === snapshot.val().creator
        });
        previousNotes = _.uniqBy(previousNotes, "id"); //making sure notes are unique by id
        this.setState({
          ListOfNotes: previousNotes,
          numberOfNotes: previousNotes.length
          //   items: previousItems.concat({
          //     i: snapshot.key,
          //     x: 0,
          //     y: 0,
          //     minW: 3,
          //     minH: 5,
          //     maxW: 12,
          //     w: 3,
          //     h: 5
          //   })
        });
      }
    });
    this.notesRef.on("child_removed", snapshot => {
      let previousNotes = this.state.ListOfNotes;
      let previousItems = this.state.items;
      previousNotes = previousNotes.filter(note => note.id !== snapshot.key);
      previousItems = previousItems.filter(item => item.id !== snapshot.key);
      this.setState({
        ListOfNotes: previousNotes,
        numberOfNotes: previousNotes.length,
        items: previousItems
      });
    });
  }

  getCurrentDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();

    if (dd < 10) {
      dd = "0" + dd;
    }

    if (mm < 10) {
      mm = "0" + mm;
    }

    today = dd + "/" + mm + "/" + yyyy;
    return today;
  }

  createNote() {
    const date = this.getCurrentDate();
    this.notesRef.push({
      creator: userId,
      upvotes: 0,
      date: date,
      contents: "",
      color: colorNotes[Math.floor(Math.random() * 7)],
      isDraggable: true,
      isEditable: true
    });
  }

  onLayoutChange(layout) {
    if (layout !== this.state.layout) {
      // update
      if (this.state.ListOfNotes.length === layout.length) {
        firebase
          .database()
          .ref("boards/")
          .once("value", snap => {
            if (snap.hasChild(this.boardId)) {
              console.log(layout);
              this.boardRef.update({
                layout: JSON.stringify({ layout: layout })
              });
              this.setState({ layout });
            }
          });
      }
      // mount
      this.setState({ layout });
    }
  }

  onBreakpointChange(breakpoint, cols) {
    this.setState({
      breakpoint: breakpoint,
      cols: cols
    });
  }

  boardMode() {
    this.boardRef.on("value", snapshot => {
      if (snapshot.val().mode === "Public") {
        this.setState({ mode: "Public" });
      } else {
        this.setState({ mode: "Incognito" });
      }
    });
  }

  redirect(where) {
    this.setState({ redirect: where });
  }

  render() {
    const {
      numberOfNotes,
      boardExists,
      numberOfPeople,
      boardName,
      mode,
      allowed,
      items,
      loading,
      redirect,
      creator
    } = this.state;
    const canChangeMode = creator === userId;
    const isVisitor = !canChangeMode;
    const imageModeName = mode === "Public" ? "witness.png" : "incognito.png";
    const ContribututionTree = () => {
      return mode === "Incognito" ? (
        <img
          id="contributionTree"
          src={require("./Images/contributions.png")}
          alt="Contribution tree"
          title="Contribution tree"
          onClick={() => this.redirect("/contributionTree/" + this.boardId)}
        />
      ) : null;
    };

    const ListOfNotes = this.state.ListOfNotes.map((note, index) => (
      <div
        key={note.id}
        data-grid={{
          ...items[index],
          static: mode === "Public" ? note.isStatic : false
        }}
      >
        <Note
          boardId={this.boardId}
          canDelete={note.creator === userId}
          numberOfPeopleOnBoard={numberOfPeople}
          upvotes={note.upvotes}
          color={note.color}
          date={note.date}
          contents={note.contents}
          id={note.id}
          isEditable={mode === "Public" ? note.isEditable : true}
        />
      </div>
    ));
    if (redirect !== "") {
      return <Redirect to={redirect} />;
    } else if (mode === "Incognito" && !allowed.includes(userId)) {
      return (
        <ErrorPage msg="The board was set to Incognito mode, you are no longer allowed to see it." />
      );
    } else if (!boardExists) {
      return <ErrorPage msg="The board was not found, please check the URL." />;
    } else {
      return (
        <div id="DashboardContainer">
          <div className="wrapper-topBoard">
            <img
              id="backToBoard"
              alt="back"
              src={require("./Images/backToBoards.png")}
              onClick={() => this.redirect("/dashboard")}
            />
            <input
              type="text"
              maxLength="30"
              readOnly={isVisitor}
              onChange={e => {
                this.setState(byPropKey("boardName", e.target.value));
              }}
              onBlur={e => {
                this.boardRef.update({ title: e.target.value });
                localStorage.setItem("boardName", e.target.value);
              }}
              value={boardName}
              onClick={e => e.target.select()}
              id="nameOfBoard"
            />
            <ContribututionTree />
            <div id="numberOfPeople">{numberOfPeople} boarder(s)</div>
            <br />
            <button id="createButton" onClick={this.createNote}>
              +
            </button>
            <div id="numberOfNotes">{numberOfNotes} notes</div>
            <SaveToMyBoards
              userId={userId}
              isVisitor={isVisitor}
              boardId={this.boardId}
            />
            <IncognitoMode
              mode={mode}
              userId={userId}
              imageModeName={imageModeName}
              canChangeMode={canChangeMode}
              boardId={this.boardId}
            />
          </div>
          <div className="listOfNotes">
            {loading ? (
              <LoaderBoard />
            ) : items.length === ListOfNotes.length ? (
              <Grid
                {...this.props}
                rowHeight={30}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                draggableHandle=".colorNote"
                draggableCancel="#deleteImg"
                margin={[10, 20]}
                onBreakpointChange={this.onBreakpointChange}
                onLayoutChange={this.onLayoutChange}
              >
                {ListOfNotes}
              </Grid>
            ) : null}
          </div>
        </div>
      );
    }
  }
}
