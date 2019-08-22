import React, { Component } from "react";
import firebase from "firebase";
import "./NavbarLoggedIn.css";
import { Redirect } from "react-router-dom";

export default class StaticNavbar extends Component {
  constructor(props) {
    super(props);
    this.HomeClick = this.HomeClick.bind(this);
    this.Logout = this.Logout.bind(this);
    this.state = {
      redirect: false,
      username: null
    };
    this.userId = localStorage.getItem("userId");
  }

  HomeClick() {
    window.location = "/dashboard";
  }
  componentDidMount() {
    firebase
      .database()
      .ref("/users/" + this.userId)
      .once("value", snapshot => {
        this.setState({
          username: (snapshot.val() && snapshot.val().username) || "Anonymous"
        });
      });
  }

  Logout() {
    firebase
      .auth()
      .signOut()
      .catch(error => {
        alert(error);
      })
      .then(() => {
        localStorage.setItem("authUsers", "false");
        localStorage.setItem("userId", "");
        this.setState({ redirect: true });
      });
  }

  render() {
    const BtnStyle = { opacity: "0", width: "140px" };
    if (this.state.redirect) {
      return <Redirect to="/homepage" />;
    }
    return (
      <div className="wrapper-NavbarLoggedIn">
        <img
          src={require("./Images/logo-full-onBlack.png")}
          className="LeftLogoRedirect"
          alt="Board"
        />
        <button
          className="LeftLogoRedirect"
          onClick={this.HomeClick}
          style={BtnStyle}
        />
        <div className="RightUsernameLogOut">
          <div id="usernameNavbar">{this.state.username}</div>
          <button id="LogoutButton" onClick={this.Logout}>
            Log out
          </button>
        </div>
      </div>
    );
  }
}
