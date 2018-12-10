import React, {Component} from 'react';
import './FirstPage.css';
import StaticNavbar from "./StaticNavbar";
import MainMessage  from './MainMessage';
import {Redirect} from 'react-router-dom';

export default class FirstPage extends Component{

    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {redirect: false};
    }

    handleClick(){
        this.setState({redirect:true});
    }
    
    render() {

    if(this.state.redirect){
        return(<Redirect to='/login'/>);
    }
        return(
          <div className="MainContainer">
           <StaticNavbar />
           <MainMessage />
           <div className="parentButton">
                <div className="validateLogin" onClick={this.handleClick}>Access my boards !</div>
           </div>    
          </div>           
        );
      }
}