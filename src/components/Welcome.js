import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import './Welcome.css';

export default class Welcome extends Component {
    
    constructor(props){
        super(props);
        this.username = localStorage.getItem('username');
        this.state = {redirect: false};
    }

    componentWillUnmount(){
        setTimeout(this.setState({redirect: true}), 4000);
    }

    render(){
        if(this.username === 'null')
        {
            return(null);
        }
        if(this.state.redirect){
            return(<Redirect to='/dashboard' />);
        }
            return(
            <div className="containerWelcome">
                    <div id='welcome'>Welcome</div>
                    <div id='on'>On</div>
                    <div id='oard'>oard</div>
                    <div id="top-oval">
                    </div>
                    <div id="bottom-oval">
                        <div id="circle">
                        </div>
                        <div id="small-thing">
                        </div>
                    </div>
                    <div id="usernameAnimation">
                        {this.username}
                    </div>
            </div>
            );
    }
    
}