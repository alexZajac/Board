import React, { Component } from "react";
import { Route, BrowserRouter, Switch, Redirect } from "react-router-dom";
import "./App.css";

import firebase from "./config/Fire";
import FirstPage from "./components/FirstPage";
import Dashboard from "./components/DashBoard";
import LoginForm from "./components/LoginForm";
import SignUpForm from "./components/SignUpForm";
import ErrorPage from "./ErrorPage";
import Welcome from "./components/Welcome";
import Board from "./components/Board";
import ContributionTree from "./components/ContributionTree";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: localStorage.getItem("authUsers"), //ensures pages refresh on every route
      boardId: localStorage.getItem("boardId"),
      boardsId: []
    };
    this.userId = null;
    this.username = null;
  }

  componentWillMount() {
    this.authListener();
    let currentdate = new Date();
    let datetime =
      "Last Sync: " +
      currentdate.getDate() +
      "/" +
      (currentdate.getMonth() + 1) +
      "/" +
      currentdate.getFullYear() +
      " @ " +
      currentdate.getHours() +
      ":" +
      currentdate.getMinutes() +
      ":" +
      currentdate.getSeconds();
  }

  authListener() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.userId = user.uid;
        this.setState({ user: "true" }, () => {
          localStorage.setItem("authUsers", "true");
        });
      } else {
        this.setState({ user: "false" }, () => {
          localStorage.setItem("authUsers", "false");
        });
      }
    });
  }

  render() {
    const PrivateRoute = ({ component: Component, ...rest }) => (
      <Route
        {...rest}
        render={props =>
          this.state.user === "true" ? (
            <Component {...props} />
          ) : (
            <Redirect to="/homepage" />
          )
        }
      />
    );

    const AuthRoute = ({ component: Component, ...rest }) => (
      <Route
        {...rest}
        render={props =>
          this.state.user !== "true" ? (
            <Component {...props} />
          ) : (
            <Redirect to="/dashboard" />
          )
        }
      />
    );

    const BoardRoute = ({ component: Component, ...rest }) => (
      <Route
        {...rest}
        render={props =>
          this.state.user === "true" ? (
            <Component {...props} />
          ) : (
            <LoginForm redirectToBoard={true} />
          )
        }
      />
    );

    return (
      <BrowserRouter id="AppWrapper">
        <Switch>
          <PrivateRoute path="/" exact component={Dashboard} />
          <BoardRoute path="/board" component={Board} />
          <PrivateRoute path="/dashboard" exact component={Dashboard} />
          <Route path="/homepage" exact component={FirstPage} />
          <AuthRoute path="/login" exact component={LoginForm} />
          <AuthRoute path="/signUp" exact component={SignUpForm} />
          <Route path="/welcome" exact component={Welcome} />
          <PrivateRoute path="/contributionTree" component={ContributionTree} />
          <Route
            render={() => (
              <ErrorPage msg="Seems like this page cannot be found." />
            )}
          />
        </Switch>
      </BrowserRouter>
    );
  }
}
