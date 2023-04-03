import logo from './logo.svg';
import './App.css';
import Notification from './firebaseNotifications/Notification'
import { requestForToken } from './firebaseNotifications/firebase';
import {useState, useEffect, useRef} from 'react'

function App() {
  const [action, setAction] = useState("send");
  const [token, setToken] = useState("");
  const [endpointARN, setEndpointARN] = useState("");
  const [endpointCounts, setEndpointCounts] = useState(1);
  const endpointRef = useRef([]);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const myDomain = 'BE_DOMAIN';
  function selectAction(event) {
    setAction(event.target.value);
  }
  function ShowSendMsgBlock() {
    return(
      <div className="App-label">
        
        Your Endpoint &nbsp; &nbsp;
        <button style={{fontSize:"calc(10px + 2vmin)"}} onClick={() => {
          setEndpointCounts(value => value+1);
        }}>+</button> &nbsp;
        <button style={{fontSize:"calc(10px + 2vmin)"}} onClick={() => {
          if (endpointCounts > 1) {
            setEndpointCounts(value => value-1);
            endpointRef.current = endpointRef.current.filter(ref => ref !== null);
          }
        }}>-</button>
        {
          Array(endpointCounts)
            .fill()
            .map((_, idx) => (
              <input className='App-input' style={{ marginTop: "1%", marginBottom:"1%"}} id='endpoint' ref={(el) => endpointRef.current[idx] =   el}></input>
            ))
        }
        {/* <input className='App-input' id='endpoint02' ref={endpointRef}></input> */}
        Your Title:&nbsp;
        <input className='App-input' id='title' ref={titleRef}></input>
        Your Content:&nbsp;
        <textarea className="App-textarea" rows="4" id='content' ref={contentRef}>
        </textarea>
        <button className="App-button" onClick={sendMessage}>Submit</button>
      </div>
    )
  }
  function registerEndpoint() {    
    fetch(myDomain, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "action": "pns_reg",
        "devices": [
            {
            "token": token
            }
        ],
        "targetPlatform": ""
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.arnList.length !== 0) setEndpointARN(data.arnList[0]);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  function sendMessage() {
    console.log(endpointRef.current);
    const myMessages = [];
    for (let index = 0; index < endpointRef.current.length; index++) {
      if (endpointRef.current[index] === null) continue;
      myMessages.push({
        title: titleRef.current.value,
        body: contentRef.current.value,
        target: endpointRef.current[index].value
      })
    }
    fetch(myDomain, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "action": "pns_sendmsg",
        "messages": myMessages
    })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.arnList.length !== 0) setEndpointARN(data.arnList[0]);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  function ShowRegisterBlock() {
    return(
      <div className="App-label">
        Status:&nbsp;
        <div style={{color: endpointARN === "" ? "grey" : "green",display: "inline-block", fontWeight:"800"}}>
          {endpointARN === "" ? "not register yet" : "registered"}
        </div>
        <br></br>
        {
          endpointARN === "" ?
          (
            <button className="App-button" onClick={registerEndpoint}>Register</button>
          ) : ""
        }              
        <br></br>
        {
          endpointARN !== "" ?
          (
            "Your endpoint ARN:" &&
            <textarea className="App-textarea" disabled rows="4">
              {endpointARN}
            </textarea>
          ) : ""
        }
      </div>
    )
  }

  useEffect(async() => {
    const myToken = await requestForToken();
    setToken(myToken);
  }, [])


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Push Notification Service
        </p>
      </header>
      <label htmlFor="operate-action" className="App-label">Choose your action:&nbsp;</label>
      <select name="operate-action" id="operate-action" className="App-label" onChange={selectAction}>
        <option value="send">Send message</option>
        <option value="register">Register</option>
      </select>
      {
        action === "send" ? 
        <ShowSendMsgBlock></ShowSendMsgBlock> : 
        <ShowRegisterBlock></ShowRegisterBlock>
      }
      <Notification />
    </div>
  );
}

export default App;
