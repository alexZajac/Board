import React, {Component} from 'react';
import './StaticNavbar.css';

export default class StaticNavbar extends Component{

    render() {
        return(
          <div className="wrapper-StaticNavbar">
            <img src={require('./Images/logo-full-greyscale.png')} className="LeftImg" alt="Board"/>
            <img src={require('./Images/react-firebase.png')} className="RightImg" alt="react + firebase app"/>
          </div>          
        );
      }
}