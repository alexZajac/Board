import React, {Component} from 'react';
import firebase from 'firebase';
import './SaveToMyBoards.css';


export default class SaveToMyBoards extends Component{

    constructor(props){
        super(props);
        this.state = {
            saved:'', 
            color:'#2FBF91', 
            isVisitor: this.props.isVisitor
        };
        this.boardId = this.props.boardId;
        this.boardRef = firebase.database().ref('/boards/');
        this.userId = this.props.userId;
        this.usersAllowedRef = firebase.database().ref('/users/'+this.userId+'/savedBoards/');
        this.toggleMode = this.toggleMode.bind(this);
        this.saveBoardForUser = this.saveBoardForUser.bind(this);
        this.deleteBoardForUser = this.deleteBoardForUser.bind(this);
    }


    componentWillMount(){
        let savedBoards = [];
        this.usersAllowedRef.on('value', snapshot =>{
            if(snapshot.val()){
                snapshot.forEach(boardSaved => {
                    savedBoards.push(boardSaved.val())
                })
            }
            
            savedBoards.includes(this.boardId) ?
                this.setState({saved: true, color:'#F5505D'})
                :
                this.setState({saved: false, color:'#2FBF91'})
                    
        })
    }

    componentWillReceiveProps(nextProps){
        if(!nextProps.isVisitor){
            this.setState({isVisitor: false})            
        } 
    }

    saveBoardForUser(){
        this.usersAllowedRef.push(this.boardId);
            firebase.database().ref('/boards/'+this.boardId+'/numberPeopleOnBoard').once('value', snap => {
                firebase.database().ref('/boards/'+this.boardId).update({
                    numberPeopleOnBoard: snap.val()+1
                });
            }); 
    }

    deleteBoardForUser(){
        this.usersAllowedRef.once('value', snapshot => {
            snapshot.forEach(boardSaved => {
                if(boardSaved.val() === this.boardId)
                    this.usersAllowedRef.child(boardSaved.key).remove();
                    this.setState({saved: false, color:'#2FBF91'});
            })

            firebase.database().ref('/boards/'+this.boardId+'/numberPeopleOnBoard').once('value', snap => {
                firebase.database().ref('/boards/'+this.boardId).update({
                    numberPeopleOnBoard: snap.val()-1
                });
            });    
        });
    }

    toggleMode(saved, canToggle = this.state.isVisitor){
        if(canToggle){
            if(saved)
                this.deleteBoardForUser();
            else
                this.saveBoardForUser();               
        }
        else{
            this.boardRef.child(this.boardId).remove();
            localStorage.removeItem('firstConnection_'+this.boardId);
        }              
    }

    render() {
    
        const {saved, color, isVisitor} = this.state;
        const canEditBtnColor = {
              border: color+' solid 3px', 
              color: color
        };
        const ownerBtn = { 
            border: '#F5505d solid 3px',
            color: '#F5505d'
        }

        const btnColor = isVisitor ? canEditBtnColor : ownerBtn;
        const message = isVisitor ? (saved ? 'Delete from My Boards' : 'Add to My Boards') : ('Delete Board (irreversible)');
        
        return(
            <div id='SaveToMyBoards' style={btnColor} onClick={() => this.toggleMode(saved)}>
                <div id='AddToMyBoardsMessage'>{message}</div>
            </div>             
        );
      }
}
