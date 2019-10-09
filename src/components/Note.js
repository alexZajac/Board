import React, { Component } from "react";
import firebase from "firebase";
import MediumEditorCustom from "./MediumEditorCustom";
import { ResizableBox } from "react-resizable";

import "./Note.css";

const boardId = localStorage.getItem("boardId");
const userId = localStorage.getItem("userId");
const notesRef = firebase.database().ref("/boards/" + boardId + "/notes");
const ColorsNote = [
  "rgba(39,11,199,1) rgba(71,12,249,1)",
  "rgba(148,24,219,1) rgba(200,26,239,1)",
  "rgba(255,110,0,1) rgba(231,75,2,1)",
  "rgba(249,15,25,1) rgba(231,14,69,1)",
  "rgba(249,12,210,1) rgba(202,12,219,1)",
  "rgba(214,255,10,1) rgba(223,220,25,1)",
  "rgba(53,255,105,1) rgba(77,212,44,1)",
  "rgba(0,172,230,1) rgba(1, 186, 192,1)"
];

export default class Note extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUpvotedByUser: false,
      upvoters: [],
      upvotes: 0,
      color: this.props.color,
      contents: this.props.contents,
      isEditable: this.props.isEditable,
      numberOfPeopleOnBoard: this.props.numberOfPeopleOnBoard
    };
    this.UpvoteNote = this.UpvoteNote.bind(this);
    this.ChangeColorOnClick = this.ChangeColorOnClick.bind(this);
    this.ModifyOpacity = this.ModifyOpacity.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
    this.canDelete = this.props.canDelete;
    this.noteId = this.props.id;
    this.noteDate = this.props.date;
  }

  componentWillMount() {
    firebase
      .database()
      .ref("boards/" + boardId + "/notes/" + this.noteId + "/upvotes")
      .on("child_added", snapshot => {
        let upvoters = this.state.upvoters;
        upvoters.push(snapshot.val());
        this.setState({
          upvotes: upvoters.length,
          isUpvotedByUser: upvoters.includes(userId)
        });
      }); //listens for upvotes added
    firebase
      .database()
      .ref("boards/" + boardId + "/notes/" + this.noteId + "/upvotes")
      .on("child_removed", snap => {
        let upvoters = this.state.upvoters;
        const removedIndex = upvoters.indexOf(snap.val());
        upvoters.splice(removedIndex, 1);
        this.setState({
          upvotes: upvoters.length,
          isUpvotedByUser: upvoters.includes(userId)
        });
      }); //listens for upvotes removed
    notesRef
      .child(this.noteId)
      .child("color")
      .on("value", snap => {
        this.setState({ color: snap.val() });
      });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isEditable) {
      this.setState({
        isEditable: true,
        numberOfPeopleOnBoard: nextProps.numberOfPeopleOnBoard
      });
    } else if (!nextProps.isEditable) {
      this.setState({
        isEditable: false,
        numberOfPeopleOnBoard: nextProps.numberOfPeopleOnBoard
      });
    }
    if (nextProps.color) {
      this.setState({ color: nextProps.color });
    }
    if (nextProps.contents) {
      this.setState({ contents: nextProps.content });
    }
  }

  UpvoteNote() {
    if (this.state.isUpvotedByUser) {
      notesRef
        .child(this.noteId)
        .child("upvotes")
        .once("value", snapshot => {
          snapshot.forEach(upvoter => {
            if (upvoter.val() === userId)
              notesRef
                .child(this.noteId)
                .child("upvotes")
                .child(upvoter.key)
                .remove();
          });
          this.setState({
            isUpvotedByUser: false,
            upvotes: this.state.upvotes - 1
          });
        });
    } else {
      notesRef
        .child(this.noteId)
        .child("upvotes")
        .push(userId);
      this.setState({ isUpvotedByUser: true, upvotes: this.state.upvotes + 1 });
    }
  }

  ChangeColorOnClick() {
    const newColor = ColorsNote[Math.floor(Math.random() * 8)];
    notesRef.child(this.noteId).update({ color: newColor });
    this.setState({ color: newColor });
  }

  ModifyOpacity(color, opacity) {
    let fc = color.indexOf(",");
    let sc = color.indexOf(",", fc + 1);
    let tc = color.indexOf(",", sc + 1);
    let substract = color.substring(0, tc);
    return substract + ", " + opacity + ")";
  }

  deleteNote = () => {
    console.log();
    notesRef.child(this.noteId).remove();
  };

  render() {
    const {
      isUpvotedByUser,
      upvotes,
      numberOfPeopleOnBoard,
      color
    } = this.state;
    let realColor = "";
    color !== null
      ? (realColor = color.split(" "))
      : (realColor = ["black", "black"]); // prevent erros on early state

    const DeleteComp = () =>
      this.canDelete ? (
        <div className="wrapper-delete" onClick={() => this.deleteNote()}>
          <img
            id="deleteImg"
            src={require("./Images/deleteNote.png")}
            title="Delete note"
            alt="Delete note"
          />
        </div>
      ) : null;

    const colorNote = {
      background:
        "linear-gradient(to right, " + realColor[0] + ", " + realColor[1] + ")"
    };
    const colorBodyNote =
      upvotes > 0
        ? {
            background:
              "linear-gradient(to right, " +
              this.ModifyOpacity(
                realColor[0],
                upvotes / numberOfPeopleOnBoard
              ) +
              ", " +
              this.ModifyOpacity(
                realColor[1],
                upvotes / numberOfPeopleOnBoard
              ) +
              ")"
          }
        : { background: "white" };
    const colorTextNote =
      upvotes / numberOfPeopleOnBoard > 0.85 &&
      (realColor[0] === "rgba(39,11,199,1)" ||
        realColor[0] === "rgba(148,24,219,1)" ||
        realColor[0] === "rgba(249,15,25,1)")
        ? { color: "white" }
        : { color: "black" };
    const MediumStyle = { ...colorBodyNote, ...colorTextNote };
    const loveImage = isUpvotedByUser ? "love.png" : "noLove.png";
    return (
      <div id="Note-body">
        <div className="colorNote" style={colorNote}>
          <DeleteComp />
        </div>
        <div id="mediumContentEditor" style={MediumStyle}>
          <MediumEditorCustom
            noteId={this.noteId}
            isEditable={this.state.isEditable}
          />
        </div>
        <div id="upvotedSection">
          <div id="likeCount">{upvotes}</div>
          <img
            alt="upvote"
            title="upvote"
            src={require("./Images/" + loveImage)}
            id="likeImage"
            onClick={() => this.UpvoteNote()}
          />
          <div id="dateNote">{this.noteDate}</div>
          <div id="hiddenColor" onClick={this.ChangeColorOnClick} />
        </div>
      </div>
    );
  }
}
