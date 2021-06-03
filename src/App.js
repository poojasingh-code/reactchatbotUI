/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import './App.css';

class App extends React.Component{
 render(){
  return (
    <div className="App">
     <div className="container">
      {/* chatbot widget  */}
      <div className="widget">
        <div className="chat_header">
          {/* Add the name of the bot here  */}
          <span className="chat_header_title">Assistant Bot</span>
          <span className="dropdown-trigger" href="#" data-target="dropdown1">
            <i className="material-icons" style={{position: "fixed", top: "8px"}}> more_vert </i>
          </span>

        {/* Dropdown menu */}
          <ul id="dropdown1" className="dropdown-content">
            <li><a href="#" id="clear">Clear</a></li>
            <li><a href="#" id="restart">Restart</a></li>
            <li><a href="#" id="close">Close</a></li>
          </ul>
        </div>

        {/* Chatbot contents goes here */}
        <div className="chats" id="chats">
          <div className="clearfix"></div>
        </div>

        {/* keypad for user to type the message  */}
        <div className="keypad">
          <textarea
            id="userInput"
            placeholder="Type a message..."
            className="usrInput"
          ></textarea>
          <div id="sendButton">
            <i className="fa fa-paper-plane" aria-hidden="true"></i>
          </div>
        </div>
      </div> 
    </div>
    </div>
  );
 }
}

export default App;
