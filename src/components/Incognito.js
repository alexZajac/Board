import React, {Component} from 'react';
import firebase from 'firebase';
import CustomUsersModal from './CustomUsersModal';
import './Incognito.css';

export default class IncognitoMode extends Component{

    constructor(props){
        super(props);
        this.state = {
            mode:this.props.mode,
            imageModeName:this.props.imageModeName, 
            canChangeMode: this.props.canChangeMode
        };
        this.boardId = this.props.boardId;
        this.userId = this.props.userId;
        this.boardRef = firebase.database().ref('/boards/'+this.boardId);
        this.toggleMode = this.toggleMode.bind(this);
    }

    toggleMode(mode){
            if(mode === 'Public')
            {
                this.setState({mode:'Incognito', imageModeName:'incognito.png'});
                this.boardRef.update({mode:'Incognito', allowed: this.userId, numberPeopleOnBoard: 1
                });
                firebase.database().ref('users').once('value', snapshot => { //remove board from public users when switched to incognito
                    snapshot.forEach(user => {
                        if(user.key !== this.userId){
                            firebase.database().ref('users/'+user.key+'/savedBoards').once('value', snap => {
                                if(snap.val()){
                                    snap.forEach(boardsaved => {                   
                                        if(boardsaved.val() === this.boardId){
                                            firebase.database().ref('users/'+user.key+'/savedBoards').child(boardsaved.key).remove();
                                        }
                                    })
                                }
                            })   
                        }
                    })
                })
                
            }
            else{
                this.setState({mode:'Public', imageModeName:'witness.png'});
                this.boardRef.update({mode:'Public'});
            }                
    }


    componentWillReceiveProps(nextProps){
        if(nextProps.canChangeMode){
              this.setState({canChangeMode: true})
        }
        if(nextProps.mode !== this.state.mode){
            this.setState({mode: this.state.mode === 'Public' ? 'Incognito' : 'Public', 
                           imageModeName: this.state.mode === 'Public' ? 'incognito.png' : 'witness.png'
        });
        }
    }

    render() {
    
        const { mode, imageModeName, canChangeMode } = this.state;
        const canChangeStyle = this.state.canChangeMode ? {cursor: 'pointer'} : {};

        const addPeopleDisplayStyle = canChangeMode ? {} : {display: 'none'};
        const colorOrGreysStyle = (mode === 'Public') ? 
        {
            filter: 'gray', 
            WebkitFilter: 'grayscale(1)'
        } 
            : 
        {
                border: '3px solid black'
        };
        let peopleMergedStyle = {...addPeopleDisplayStyle, ...colorOrGreysStyle};

        return(
          <div id='incognitoWrapper'>
            <img src={require('./Images/addPeopleColor.png')} style={peopleMergedStyle} alt = 'Add people...' title= {(this.state.mode === 'Incognito') ? 'Add people...' : null} id='addPeopleImage'/>
            <CustomUsersModal shouldOpen={canChangeMode && mode === 'Incognito'} boardId={this.boardId}/>
            <div id='changeViewMode' style={canChangeStyle} onClick={() => canChangeMode ?  this.toggleMode(mode) : null}>
                <img src={require('./Images/'+imageModeName)} alt='Board Mode' title='Board Mode' id='canViewImage'/>
                <div id='viewComment'>{mode}</div>
            </div>   
          </div>
                      
      );
      }
}
