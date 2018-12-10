import React, {Component} from 'react';
import Modal from 'react-modal';
import firebase from 'firebase';
import './CustomUsersModal.css';
import UsernameSuggestions from './UsernameSuggestions';

Modal.setAppElement('#root');
const customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
  };

export default class CustomUsersModal extends Component {
    constructor(props){
        super(props);

        this.state = {
            modalIsOpen: false, 
            shouldOpen: this.props.shouldOpen,
            users:[]
        }
        this.boardId = this.props.boardId;
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.shouldOpen || !nextProps.souldOpen)
            this.setState({shouldOpen: nextProps.shouldOpen})
    }

    openModal(){
        firebase.database().ref('users').on('child_added', snapshot => {
            let users = this.state.users;
            users.push({
                id: snapshot.key,
                email: snapshot.val().email,
                username: snapshot.val().username
            })
            
            this.setState({users: users, modalIsOpen: true})
        })
    }

    closeModal(){
        this.setState({modalIsOpen: false, users:[]});
    }

    render(){
        const {shouldOpen, users} = this.state;
        if(shouldOpen){
            return(
                <div id='modal-wrapper'>
                    <button id='btnOpenModal' onClick={this.openModal}>Open Modal</button>
                    <Modal
                        isOpen={this.state.modalIsOpen}
                        onRequestClose={this.closeModal}
                        style={customStyles}
                        contentLabel="Example Modal"
                        className="Modal"
                        overlayClassName="Overlay"
                    >
    
                        <h2 id='mainInfoModal'>You can add up to 5 people to your Board!</h2>
                        <button id='closeModalBtn' onClick={this.closeModal}>X</button>
                        <h3 style={{marginTop: '20px'}}>Boarder 1 </h3>
                            <UsernameSuggestions users={users} boardId={this.boardId} />
                        <h3 style={{marginTop: '20px'}}>Boarder 2</h3>
                            <UsernameSuggestions users={users} boardId={this.boardId} />
                        <h3 style={{marginTop: '20px'}}>Boarder 3</h3>
                            <UsernameSuggestions users={users} boardId={this.boardId} />
                        <h3 style={{marginTop: '20px'}}>Boarder 4</h3>
                            <UsernameSuggestions users={users} boardId={this.boardId} />
                        <h3 style={{marginTop: '20px'}}>Boarder 5</h3>
                            <UsernameSuggestions users={users} boardId={this.boardId} />
                    </Modal>
                </div>
            );
        }
        else{
            return(null);
        }

    }
}