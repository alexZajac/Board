import React, { Component } from "react";
import { Redirect }from 'react-router-dom';
import './ErrorPage.css';

export default class ErrorPage extends Component{

    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = { redirect: false };
        this.msg = this.props.msg;
    }

    handleClick(){
        this.setState({redirect:true});
    }

    render(){
        if(this.state.redirect){
            return(<Redirect to='/dashboard'/>);
        }
        return(
            <div className="container">
                <div className='textErrorerror'>Error</div>
                <div className='textError404'>404</div>
                <div className="boo-wrapper">
                         <div className="boo">
                            <div className="face">
                            </div>
                        </div>
                    <div className="shadow"></div>

                    <h1 id="Oops">Oops!</h1>
                    <p id="cannotFindPage">
                        {this.msg}
                    </p><br/>
                    <button className="validateLogin" onClick={this.handleClick}>Back to home</button>
                </div>
            </div>

        );
    }
}