import React, { Component } from 'react';
import './UsernameSuggestions.css';
import Fuse from 'fuse.js';
import Select from 'react-select';
import firebase from 'firebase';


const randomBorder = ['#ff4cb4', '#00ace6', '#E4F13E'];

export default class UsernameSuggestions extends Component {
    constructor(props){
        super(props);
        this.state = {
            query: '',
            results: [], 
            users: this.props.users, 
            userAdded: false
          }
        this.findUsers = this.findUsers.bind(this);
        this.addUserToBoard = this.addUserToBoard.bind(this);
        this.boardId = this.props.boardId;
    }

    componentWillReceiveProps(nextProps){
      if(nextProps.users.length > 0){
        this.setState({users: nextProps.users});
      }
    }

    handleChange = (query) => {
        this.setState({ query });
    }

    findUsers(value, query){
      let users = this.state.users;
      if (value && value.length > 3) { 
          let optionsforSearch = {
                                    shouldSort: true,
                                    threshold: 0.2,
                                    location: 0,
                                    distance: 100,
                                    maxPatternLength: 12,
                                    minMatchCharLength: 1,
                                    keys: [ {
                                      name: "username",
                                      weight:0.6
                                    }, 
                                    {
                                      name:"email", 
                                      weight:0.4
                                    } ]
          };
          let fuse = new Fuse(users, optionsforSearch);
          this.setState({results: fuse.search(value), query: value}); 
      }
      
      
    }

    addUserToBoard(userId){

      firebase.database().ref('boards/'+this.boardId+'/allowed').once('value', snapshot => {
        if(snapshot.val() !== userId){
          firebase.database().ref('/boards/'+this.boardId).update({
            allowed: snapshot.val()+' '+userId
        });
        this.setState({userAdded: true})
        }   
      });
    }

  render() {

    const {query, results, userAdded, users} = this.state;
    let resultsToOptions = [];
    results.forEach(user => {
      resultsToOptions.push({value: user.id, label: user.username+' ('+user.email+')'})
    });
    const rndColor = randomBorder[Math.floor(Math.random() * 3)];
    const customStyles = {
      option: (base, { isFocused }) => ({
        ...base,
        borderBottom: '1px dotted gray',
        color: 'black',
        padding: '6px',
        background: isFocused ? 'lightblue' : 'white'
      }),
      control: () => ({
        background:'white',
        width:'70%',
        height:'50%',
        fontSize:'20px',
        color:'black',
        borderRadius:'20px',
        border: 'solid 4px '+rndColor
      }),
      indicatorsContainer: () => ({
          position: 'absolute',
          top:'15%',
          right:'32%'
      })
    }
   
    let isFound = '';
    
    resultsToOptions.forEach( user => {
      (user.label === query.label) ? isFound = user.value : null; //verifyng the input is truly a user proposed in the selection and taking its userId
    })

    let AddBtn;
    isFound !== '' ? 
      AddBtn = () => {return (<div style={{background: rndColor, cursor: 'pointer'}} onClick={() => this.addUserToBoard(isFound)} id='addUserToBoard'>+</div>)} 
      : 
      AddBtn = () => {return(null)};

    userAdded ? 
      AddBtn = () => {return (<div style={{background: '#2FBF91', cursor:'default'}} id='addUserToBoard'></div>)} 
      : 
      null;
   
    return (
      <form id='USwrapper'>
        <Select
          styles={customStyles}
          placeholder='Search users...'
          value={query}
          options={resultsToOptions}
          onChange={this.handleChange}
          onInputChange={e => this.findUsers(e, query)}
        />
        <AddBtn/>
      </form>
    );
  }
}
