import React, {Component} from 'react';
import fire from '../config/Fire';
import firebase from 'firebase';
import {Redirect} from 'react-router-dom';
import './LoginForm.css';



const INITIAL_STATE = {
    email: '',
    password: '', 
    Error:null, 
    redirect:false
  };

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
  });

const redirectBoardId = localStorage.getItem('redirectBoardId');

export const ErrorMsg = (props) => {
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

export default class LoginForm extends Component{
    constructor(props){
        super(props);
        this.HandleLogin = this.HandleLogin.bind(this);
        this.HandleSignUp = this.HandleSignUp.bind(this);
        this.SignUpWithGoogle = this.SignUpWithGoogle.bind(this);
        this.SignUpWithFacebook = this.SignUpWithFacebook.bind(this);
        this.state = {...INITIAL_STATE};
        this.errorMessage = null;
        this.pathRedirect = null;
        this.redirectToBoard = this.props.redirectToBoard || false;
        console.log(this.redirectToBoard)
    }

    HandleLogin(e){
      const { email, password } = this.state;
      fire.auth().signInWithEmailAndPassword(email, password)
      .catch(error => {
        if(error.code === "auth/user-not-found"){
            this.errorMessage = 'User not found';
            this.setState({email:'',password:''});
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
            if(user) {         
                if(this.redirectToBoard){
                    this.pathRedirect = '/board/'+redirectBoardId
                } 
                else{
                    this.pathRedirect = '/dashboard'; 
                }
                    
                localStorage.setItem('userId', user.uid);
                this.userId = user.uid;  
                this.setState({ redirect:true });      
            }
          });
        e.preventDefault();
        
    }
 
    HandleSignUp(e){
        e.preventDefault();
        this.pathRedirect = '/signUp';   
        this.setState({ redirect:true });
    }
    


    SignUpWithGoogle() {
        var Googleprovider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().useDeviceLanguage();
        firebase.auth().signInWithPopup(Googleprovider).then(result => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            // const token = result.credential.accessToken;
            // The signed-in user info.
            const user = result.user;
          }).catch(error => {
            // Handle Errors here.
            //const errorCode = error.code;
            alert(error);
            this.setState({Error: error.message});
          });
          firebase.auth().onAuthStateChanged(user => {
            if(user) {         
                this.pathRedirect = '/dashboard';   
                let userRoot = firebase.database().ref("users").child(user.uid);
              userRoot.update({
                    username: user.displayName,
                    email: user.email, 
                    photoURL: user.photoURL
                });
                localStorage.setItem('userId', user.uid);
                if(this.redirectToBoard)
                    window.location = '/board/'+redirectBoardId
                else
                    window.location = '/dashboard';  
            }
          });
    }

    SignUpWithFacebook() {
        var Facebookprovider = new firebase.auth.FacebookAuthProvider();

        firebase.auth().useDeviceLanguage();
        firebase.auth().signInWithPopup(Facebookprovider).then(result => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            //const token = result.credential.accessToken;
            // The signed-in user info.
            const user = result.user;
             
          }).catch(error => {
            // Handle Errors here.
            alert(error);
            //const errorCode = error.code;
            this.setState({Error: error.message});
          });     
          firebase.auth().onAuthStateChanged(user => {
            if(user) {                    
              let userRoot = firebase.database().ref("users").child(user.uid);
              userRoot.update({
                    username: user.displayName,
                    email: user.email, 
                    photoURL: user.photoURL
                });
                localStorage.setItem('userId', user.uid); 
                if(this.redirectToBoard)
                    window.location = '/board/'+redirectBoardId
                else
                    window.location = '/dashboard'; 
            }
          });   
    }


    render() {

        const {email, password, Error} = this.state;

        if(this.pathRedirect !== null){
            return(<Redirect to={ this.pathRedirect}/>);
        }

          return(
            <div>
                <div id="LoginFormWrapper"></div>
                    <div className="col-md-6" id="login-wrapper"><br/>
                    <p id='msgLogin'>Nice to see you again !</p><br/>
                    <form onSubmit={this.HandleLogin}>
                        <div className="form-group">
                            <label className = "labelLogin" htmlFor="exampleInputEmail">Email address</label>
                            <input value ={email} required onChange={e => this.setState(byPropKey('email', e.target.value))} type="email" name="email"
                            className="form-control" id="exampleInputEmail" aria-describedby="emailHelp" placeholder="Enter Email" />
                            <small id="emailHelp" className="form-text text-muted">We'll never disclose any information</small>
                        </div><br/>
                        <div className="form-group">
                            <label className = "labelLogin" htmlFor="exampleInputPassword">Password</label>
                            <input value ={password} required onChange={e => this.setState(byPropKey('password', e.target.value))} type="password" name="password"
                            className="form-control" id="exampleInputPassword" placeholder="Enter Password" />
                            <small id="PasswordHelp" className="form-text text-muted">Keep it secret !</small>
                        </div><br/>
                        <button  className="btn btn-primary" id="LoginButton">Log in</button>
                        <div><br/><button onClick={this.HandleSignUp} className="btn btn-primary" id="SignUpButton">Sign up</button></div>
                        <div>or continue with</div>
                        <div>
                            <p onClick={this.SignUpWithGoogle} className='SignupBtn google'></p>
                            <p onClick={this.SignUpWithFacebook} className='SignupBtn facebook'></p>
                        </div> 
                    </form> 
                    <ErrorMsg ErrorProps={Error}/>                
                    </div>
            </div>
        );
      }
}
