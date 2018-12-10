import React, {Component} from 'react';
import './MainMessage.css';

export default class MainMessage extends Component{

    render() {
        return(
          <div className="wrapper-MainMsg">
            <br/>
            <img alt='Board Logo' src={require('./Images/logo-full-onWhite.png')} /><br/><br/><br/>
            <h1>Board is a free, user-friendly and new web-app that lets you organize your ideas.</h1><br/>
            <p>You will never forget your ideas anymore, and you will be able to link them dynamically and to share them with your team. With Board, take your brainstorming to the next level.</p>
          </div>          
        );
      }
}