import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import NavbarLoggedIn from "./NavbarLoggedIn";
import YourBoards from "./YourBoards";
import "./Dashboard.css";

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false
    };
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) {
      return <Redirect to="/homepage" />;
    }

    return (
      <div id="DashboardWrapper">
        <NavbarLoggedIn />
        <YourBoards />
      </div>
    );
  }
}
