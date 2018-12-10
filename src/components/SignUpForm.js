import React, {Component} from 'react';
import firebase from 'firebase';

import './SignUpForm.css';
import {Redirect} from 'react-router-dom';

const INITIAL_STATE = {
    email: '',
    password: '', 
    username:'',
    Error:null, 
    redirect:false
  };

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
  });

const ErrorSignUp = (props) => {
    let res;
    props.ErrorProps !== null ? 
        res = <div id='error'>
                    <img id='errorImg' alt='Error' src={require("./Images/error.png")} />
                    {props.ErrorProps}
              </div>
        : 
        res = null;
    return(res);
}
export default class SignUpForm extends Component{
    constructor(props){
        super(props);
        this.HandleSignUp = this.HandleSignUp.bind(this);
        this.Login = this.Login.bind(this);
        this.HandleLogin = this.HandleLogin.bind(this);
        this.state = {...INITIAL_STATE};
        this.errorMessage = null;
        this.username = null;
    }

    HandleSignUp(e){     
        const { email, password, username } = this.state;
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .catch(error => {
            if (error.code === "auth/email-already-in-use"){
                this.errorMessage = 'Email is already taken';
                this.setState({email:''});
              }
            else if (error.code === "auth/weak-password"){
                this.errorMessage = 'Password is too weak';
                this.setState({email:''});
              }
            else if(error.code !== ''){
                this.errorMessage = error.code;
            }
            if(this.errorMessage !== null){
                this.setState({Error: this.errorMessage});
                setTimeout(() => {this.setState({Error:null});}, 2300); //gets back to null after rendering the error animation
            }
        }).then(() => {
            if(this.errorMessage == null){
                this.Login(email, password, username);
            }
        });  
        e.preventDefault();
            
    }

    Login(email, password, username){
    firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(error => {
          if(error.code === "auth/user-not-found"){
              this.errorMessage = 'User not found';
              this.setState({password,email:''});
            }
          else if (error.code === "auth/wrong-password"){
              this.errorMessage = 'Wrong Password';
              this.setState({password:''});
            }
          else if(error.code === 'auth/invalid-email'){
              this.errorMessage = 'Please enter email';
              this.setState({email:''});
            }
          else if(error.code !== ''){
              this.errorMessage = error.code;
          }
          if(this.errorMessage !== null){
              this.setState({Error: this.errorMessage});
              setTimeout(() => {this.setState({Error:null});}, 2300); //gets back to null after rendering the error animation
          }
        });
          firebase.auth().onAuthStateChanged(user => {
            if (user) {
              let userRoot = firebase.database().ref("users");
              userRoot.child(user.uid).set({
                    username: username,
                    email: email, 
                    lastEdit:'',
                    savedBoards:''
                });
              this.pathRedirect = '/dashboard';
              localStorage.setItem('userId', user.uid);
              this.setState({ redirect:true });
            }
          });
          
      }

      HandleLogin(e){
        e.preventDefault();
        this.pathRedirect = '/login';   
        this.setState({ redirect:true });
      }


    render() {

        const {email, password, username, Error, redirect} = this.state;

        if(redirect) {
            return(<Redirect to={this.pathRedirect} />);
        }
        return(
            <div>
                <div id="LoginFormWrapper"></div>
                    <div className="col-md-6" id="signup-wrapper"><br/>
                    <p id='msgLogin'>Join Board right now !</p><br/>
                    <form onSubmit={this.HandleSignUp}>
                        <div className="form-group">
                            <label className = "labelLogin" htmlFor="exampleInputEmail">Email address</label>
                            <input value ={email} required onChange={e => this.setState(byPropKey('email', e.target.value))} type="email" name="email"
                            className="form-control" id="exampleInputEmail" aria-describedby="emailHelp" placeholder="Enter Email" />
                            <small id="emailHelp" className="form-text text-muted">We'll never dislose any information</small>
                        </div>
                        <div className="form-group">
                            <label className = "labelLogin" for="exampleInputUsername">Username</label>
                            <input value ={username} required onChange={e => this.setState(byPropKey('username', e.target.value))} type="text" name="username"
                            className="form-control" id="exampleInputUsername" aria-describedby="emailHelp" placeholder="Be creative" />
                            <small id="UsernameHelp" className="form-text text-muted">Simple or freaky !</small>
                        </div>
                        <div className="form-group">
                            <label className = "labelLogin" for="exampleInputPassword">Password</label>
                            <input value ={password} required onChange={e => this.setState(byPropKey('password', e.target.value))} type="password" name="password"
                            className="form-control" id="exampleInputPassword" placeholder="Enter Password" />
                            <small id="PasswordHelp" className="form-text text-muted">Keep it simple ! (at least 6 characters)</small>
                        </div><br/>
                        <button className="btn btn-primary" id="RegisterButton">Sign Up</button>
                        <div><br/><button onClick={this.HandleLogin} className="btn btn-primary" id="SignUpButton">Log In</button></div>               
                    </form>
                    <ErrorSignUp ErrorProps={Error}/>
                    </div>
            </div>
        );
      }
}

