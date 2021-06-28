import React, { Component } from 'react'
import { findAllInRenderedTree } from 'react-dom/test-utils'
import Web3 from 'web3'
import './App.css'
import { MESSAGES_ABI, MESSAGES_ADDRESS } from './config'
import Messages from './Components/Messages'
import Header from './Components/Header'
class App extends Component {
  componentWillMount() {
    this.loadBlockchainData()


   
  }
  
  async decrypt (salt, encoded){
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
    return encoded
      .match(/.{1,2}/g)
      .map((hex) => parseInt(hex, 16))
      .map(applySaltToChar)
      .map((charCode) => String.fromCharCode(charCode))
      .join("");
  };
  async loadBlockchainData() {
    const crypt = (salt, text) => {
      const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
      const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
      const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
    
      return text
        .split("")
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join("");
    };
    
    const decrypt = (salt, encoded) => {
      const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
      const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);

      return encoded
        .match(/.{1,2}/g)
        .map((hex) => parseInt(hex, 16))
        .map(applySaltToChar)
        .map((charCode) => String.fromCharCode(charCode))
        .join("");
    };


    // decrypting
    //const decrypted_string = decrypt("awoi0012d", encrypted_text); // -> Hello
 //4d657373616765
 //console.log("STUFF",encrypted_text,decrypted_string)
    const web3 = new Web3("http://192.168.0.238:7545")
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const messageList = new web3.eth.Contract(MESSAGES_ABI, MESSAGES_ADDRESS)
    this.setState({ messageList })
    console.log("HELLO", messageList.methods)
    const messageCount = await messageList.methods.messageCount().call()
    const chatCount = await messageList.methods.getChatLength(this.state.chatHash).call()
    console.log("Chat length", chatCount)
    this.setState({ chatCount })

    this.setState({ messageCount })
    if(this.state.chatHash != ''){
      
      var hashCode = [this.state.user,this.state.targetUser]
      hashCode.sort()
      hashCode = hashCode[0] + hashCode[1]

      //hashCode.sort()
      const messages = await messageList.methods.getMessages(hashCode).call()
      var encrypted_messages = messages[2]
      var decrypted_messages = []
      for(var i = 0; i< encrypted_messages.length;i++){
           var decrpted = await decrypt(this.state.encryption, encrypted_messages[i])
        decrypted_messages.push(decrpted)
      //  encrypted_messages[2][i] = 

        //encrypted_messages['2'][i] = decrypt(this.state.encryption, messages['2'][i])
      }
      var finalData = {
        0 : messages['0'],
        1 : messages['1'],
        2 : decrypted_messages,
        3 : messages['3']
      }

      this.setState({ chatCount : decrypted_messages.length })
      this.setState({ messages: finalData })
      var objDiv = document.getElementById("messages");
      objDiv.scrollTop = objDiv.scrollHeight;

    }
    //setTimeout(function(e){ console.log("E",e) /*this.loadBlockchainData()*/ }, 3000);

    

  }
 
 
 async addOne() {
  const crypt = (salt, text) => {
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
  
    return text
      .split("")
      .map(textToChars)
      .map(applySaltToChar)
      .map(byteHex)
      .join("");
  };
  var hashCode = [this.state.user,this.state.targetUser]
  hashCode.sort()

  const encrypted_message = crypt(this.state.encryption, this.state.toSend); // -> 426f666665
  hashCode = hashCode[0] + hashCode[1]
    this.state.messageList.methods.createMessage(this.state.user, this.state.targetUser,encrypted_message, hashCode).send({from: this.state.account, gas:3000000}).once('receipt', async (receipt) => {
      this.loadBlockchainData()
      document.getElementById('message').value = ''
      
      console.log(receipt)
      
    })
    console.log("sent")
}
  constructor(props) {
    super(props)
    this.state = { account: '' , messageList : undefined, messages : {0: []}, toSend : "", user : '', targetUser : '', chatHash : ''}
  }

  render() {
    return (
      <div>
                <Header />

      <div className="container">
        <h1 >Smart Messenger</h1>
        <p>A peer-to-peer encrypted messaging service that only uses blockchain to transfer and store encrypted messages.</p>
     
        <div class="input-group mb-3">
        <span class="input-group-text" id="basic-addon1"><i class="fas fa-key"></i></span>
        <input type="text" class="form-control" placeholder="Encryption Key" aria-label="Encryption Key" aria-describedby="basic-addon1" onChange={(e)=>{this.setState({encryption : e.target.value})}}/>
        </div>
        <div class="input-group mb-3">
        <span class="input-group-text" id="basic-addon1">@</span>
        <input type="text" class="form-control" placeholder="Your username" aria-label="Your username" aria-describedby="basic-addon1" onChange={(e)=>{this.setState({user : e.target.value, chatHash : this.state.user +this.state.targetUser})}}/>
        </div>
        <div class="input-group mb-3">
        <span class="input-group-text" id="basic-addon1">@</span>
        <input type="text" class="form-control" placeholder="Target username" aria-label="Target username" aria-describedby="basic-addon1" onChange={(e)=>{this.setState({targetUser : e.target.value, chatHash : this.state.user +this.state.targetUser})}}/>
        </div>
    

        <p>Total chats: {this.state.messageCount}</p>
        <p>Your chats: {this.state.chatCount}</p>
        <div id ="messages" style={{width:'auto',height:'400px',overflowX : 'hidden', overflowY : 'auto'}}>
         {this.state.messages[0].map((message, index)=> (<Messages message = {message} index= {index} messages = {this.state.messages} />))}

        </div>

        <input id="message" onChange={(e)=>{this.setState({toSend : e.target.value})}}/>
        <button type="button" class="btn btn-primary" onClick={this.addOne.bind(this)}><i class="fas fa-paper-plane"></i></button>

     
        <br/>
        <button type="button" class="btn btn-success" onClick={this.loadBlockchainData.bind(this)}><i class="fas fa-sync"/>Refresh chat</button>


       
      </div>
      </div>

    );
  }
}

export default App;