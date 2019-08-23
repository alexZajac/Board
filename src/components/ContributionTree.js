import React, { Component } from "react";
import "./ContributionTree.css";
import LoaderBoard from "./LoaderBoard";
import firebase from "firebase";
import d3 from "d3";
import { Redirect } from "react-router-dom";

const randomColors = ["#00ACE6", "#E4F13E", "#FF4CB4"];
const boardId = localStorage.getItem("boardId");
const userId = localStorage.getItem("userId");
const boardRef = firebase.database().ref("boards/" + boardId);
const userRef = firebase.database().ref("users/" + userId + "/username");

export default class ContributionTree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      redirect: "",
      data: [],
      username: "",
      wantHelp: false
    };
    this.usersAllowed = [];
    this.boardNotes = [];
    this.createTree = this.createTree.bind(this);
    this.handleHelp = this.handleHelp.bind(this);
  }

  componentDidMount() {
    //Here we'll establish a function of three variables for each user in order to build an object to push in the data array
    //getting all users Ids
    boardRef.child("allowed").once("value", snapshot => {
      if (/\s/.test(snapshot.val()))
        //if multiple users means if white space
        this.usersAllowed = snapshot.val().split(" ");
      else this.usersAllowed.push(snapshot.val());
    });

    //getting the notes on the board
    boardRef.child("notes").once("value", snapshot => {
      snapshot.forEach(note => {
        this.boardNotes.push({
          contents: note.val().contents,
          creator: note.val().creator,
          upvotes: note.val().upvotes
        });
      });
      //getting target key for building each nodes in the tree
      const targetsForNodes = [];
      const NbrUsers = this.usersAllowed.length;
      for (let i = 0; i < NbrUsers; i++) {
        targetsForNodes.push(i);
      }

      //FIRST COEF:
      let nbOfNotes = 0;
      let totalNotes = 0;
      let originalNotesCoef = 0;
      //SECOND COEF
      let contentInNotes = "";
      let totalContentOfNotes = "";
      let originalContentCoef = 0;
      //THIRD COEF
      let nbOfLikesOnNotes = 0;
      let totalNbOfLikes = 0;
      let originalLikeCoef = 0;

      this.usersAllowed.forEach(user => {
        //looping over each user
        //FIRST COEF
        nbOfNotes = 0;
        totalNotes = 0;

        //SECOND COEF
        contentInNotes = "";
        totalContentOfNotes = "";

        //THIRD COEF
        nbOfLikesOnNotes = 0;
        totalNbOfLikes = 0;

        this.boardNotes.forEach(note => {
          if (note.creator === user) {
            nbOfNotes++;
            contentInNotes += note.contents;
            if (note.upvotes !== null && note.upvotes !== undefined)
              if (Object.values(note.upvotes).includes(user))
                //make sure you can convert to object
                nbOfLikesOnNotes += Object.keys(note.upvotes).length - 1;
              // number of object upvotes keys
              else nbOfLikesOnNotes += Object.keys(note.upvotes).length;
          }
          totalNotes++;
          totalContentOfNotes += note.contents;
          totalNbOfLikes +=
            note.upvotes !== null && note.upvotes !== undefined
              ? Object.keys(note.upvotes).length
              : 0;
        });
        originalNotesCoef = Math.round((nbOfNotes / totalNotes) * 100) / 100;
        originalContentCoef =
          Math.round(
            (contentInNotes.length / totalContentOfNotes.length) * 100
          ) / 100;
        originalLikeCoef =
          totalNbOfLikes === 0
            ? 0
            : Math.round((nbOfLikesOnNotes / totalNbOfLikes) * 100) / 100;

        const valueUser = this.createValueFromCoefs(
          originalNotesCoef,
          originalContentCoef,
          originalLikeCoef
        );
        //getting userName
        firebase
          .database()
          .ref("users/" + user)
          .once("value", snapshot => {
            let username = snapshot.val().username;
            const previousData = this.state.data;
            previousData.push({
              name: username,
              value: Math.round(valueUser * 200), //max for circle width is 200
              target: targetsForNodes
            });
            userRef.once("value", snap => {
              this.setState({
                data: previousData,
                username: snap.val(),
                isLoading: false
              });
            });
          });
      });
    });
  }

  componentDidUpdate() {
    this.createTree();
  }

  createValueFromCoefs(x, y, z) {
    return 0.22 * x + 0.38 * y + 0.4 * z;
  }

  createTree() {
    const node = this.node;
    const { data, username } = this.state;
    const w = 1000,
      h = 700,
      circleWidth = 20;

    let links = [];
    data.forEach(people => {
      for (let i = 0; i < data.length; i++)
        links.push({
          source: people,
          target: data[people.target[i]]
        });
    });

    let myChart = d3.select(node);
    let force = d3.layout
      .force()
      .nodes(data)
      .links([])
      .gravity(0.2)
      .charge(-2000)
      .size([w, h]);

    let link = myChart
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "white")
      .attr("strokewidth", "1");

    let bubble = myChart
      .selectAll("circle")
      .data(data)
      .enter()
      .append("g")
      .call(force.drag);

    bubble
      .append("circle")
      .attr("cx", d => {
        return d.x;
      })
      .attr("cy", d => {
        return d.y;
      })
      .attr("r", d => {
        return circleWidth + d.value;
      })
      .attr("fill", d => {
        if (d.name === username) {
          return "white";
        } else
          return randomColors[Math.floor(Math.random() * randomColors.length)];
      })

      .attr("strokewidth", i => {
        if (i > 0) {
          return "0";
        } else {
          return "2000";
        }
      })
      .attr("stroke", d => {
        if (d.name === username) {
          return "black";
        } else return "white";
      });

    force.on("tick", () => {
      bubble.attr("transform", d => {
        return "translate(" + d.x + "," + d.y + ")";
      });

      link
        .attr("x1", d => {
          return d.source.x;
        })
        .attr("y1", d => {
          return d.source.y;
        })
        .attr("x2", d => {
          return d.target.x;
        })
        .attr("y2", d => {
          return d.target.y;
        });
    });

    bubble
      .append("text")
      .text(d => {
        return d.name;
      })
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-size", d => {
        if (d.name.length <= 6) {
          if (d.value < 20) return "8px";
          else if (d.value >= 20 && d.value < 30) return "12px";
          else if (d.value >= 30 && d.value < 50) return "16px";
          else if (d.value >= 50 && d.value < 70) return "22px";
          else if (d.value >= 70 && d.value < 90) return "28px";
          else return "36px";
        } else if (d.name.length > 6 && d.name.length <= 12) {
          if (d.value < 20) return "6px";
          else if (d.value >= 20 && d.value < 30) return "10px";
          else if (d.value >= 30 && d.value < 50) return "12px";
          else if (d.value >= 50 && d.value < 70) return "18px";
          else if (d.value >= 70 && d.value < 90) return "22px";
          else return "30px";
        } else {
          if (d.value < 20) return "5px";
          else if (d.value >= 20 && d.value < 30) return "10px";
          else if (d.value >= 30 && d.value < 50) return "12px";
          else if (d.value >= 50 && d.value < 70) return "14px";
          else if (d.value >= 70 && d.value < 90) return "18px";
          else return "24px";
        }
      });
    force.start();
  }

  redirect() {
    this.setState({ redirect: "/board/" + boardId });
  }

  handleHelp() {
    this.setState({ wantHelp: !this.state.wantHelp });
  }

  render() {
    const { isLoading, redirect, wantHelp } = this.state;
    const boardName = localStorage.getItem("boardName");
    const styleHelp = wantHelp ? { display: "block" } : { display: "none" };

    if (redirect !== "") {
      return <Redirect to={redirect} />;
    } else
      return (
        <div>
          <img
            id="backToYourBoard"
            alt="back"
            title="back"
            src={require("./Images/backToBoards.png")}
            onClick={() => this.redirect()}
          />
          <div id="titleTree">Contribution Tree for {boardName}</div>
          <span id="helpTreeText" style={styleHelp}>
            Each circle represents a user in terms of his contribution to the
            Board, you are represented in white !
          </span>
          <img
            id="helpTree"
            src={require("./Images/helpTree.png")}
            alt="Help"
            title="Help"
            onClick={this.handleHelp}
          />
          {isLoading ? (
            <LoaderBoard />
          ) : (
            <div className="svg-container">
              <svg
                ref={node => (this.node = node)}
                preserveAspectRatio="xMinYMin meet"
                viewBox="0 0 1000 800"
                className="svg-content-responsive"
              />
            </div>
          )}
        </div>
      );
  }
}
