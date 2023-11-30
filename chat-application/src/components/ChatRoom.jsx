import { useState } from "react";

import SockJS from "sockjs-client";
import { over } from "stompjs";
import Register from "./Register";

let stompClient = null;

export default function ChatRoom() {
  const [publicChats, setPublicChats] = useState([]);
  const [privateChats, setPrivateChats] = useState(new Map());
  const [tab, setTab] = useState("Group");
  const [userDetails, setUserDetails] = useState({
    userName: "",
    message: "",
    connected: false,
    status: "",
  });

  const handleChange = (event) => {
    const username = event.target.value;
    setUserDetails((prevValue) => {
      return { ...prevValue, userName: username };
    });
  };
  const onClickHandler = () => {
    let Sock = new SockJS("http://localhost:8080/ws");
    stompClient = over(Sock);
    stompClient.connect({}, onConnect, onError);
  };
  const onConnect = () => {
    setUserDetails((prevValue) => ({ ...prevValue, connected: true }));
    stompClient.subscribe("/group/public", publicMessageReceived);
    stompClient.subscribe(
      `/user/${userDetails.userName}/private`,
      privateMessageReceived
    );
    userJoin();
  };
  const onError = (error) => {
    console.log(error);
  };
  const userJoin = () => {
    if (stompClient) {
      const chatMessage = {
        senderName: userDetails.userName,
        status: "JOIN",
      };
      stompClient.send("/app/public-message", {}, JSON.stringify(chatMessage));
    }
  };
  const publicMessageReceived = (payload) => {
    const payloadData = JSON.parse(payload.body);
    switch (payloadData.status) {
      case "JOIN":
        if (!privateChats.get(payloadData.senderName)) {
          privateChats.set(payloadData.senderName, []);
          setPrivateChats(new Map(privateChats));
        }
        break;
      case "MESSAGE":
        setPublicChats((prevValue) => [...prevValue, payloadData]);
        break;
    }
  };
  const privateMessageReceived = (payload) => {
    const payloadData = JSON.parse(payload.body);
    if (privateChats.get(payloadData.senderName)) {
      privateChats.get(payloadData.senderName).push(payloadData);
      setPrivateChats(new Map(privateChats));
    } else {
      let list = [];
      list.push(payloadData);
      privateChats.set(payloadData.senderName, list);
      setPrivateChats(new Map(privateChats));
    }
  };
  const handleMessage = (event) => {
    setUserDetails((prevValue) => ({
      ...prevValue,
      message: event.target.value,
    }));
  };
  const onSendPublicMessage = () => {
    if (stompClient) {
      const chatmessage = {
        senderName: userDetails.userName,
        message: userDetails.message,
        status: "MESSAGE",
      };
      stompClient.send("/group/public", {}, JSON.stringify(chatmessage));
      setUserDetails((prevValue) => ({
        ...prevValue,
        message: "",
      }));
    }
  };
  const onSendPrivateMessage = () => {
    if (stompClient) {
      const chatMessage = {
        senderName: userDetails.userName,
        receiverName: tab,
        message: userDetails.message,
        status: "JOIN",
      };
      if (userDetails.userName !== tab) {
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserDetails((prevValue) => ({
        ...prevValue,
        message: "",
      }));
    }
  };
  return (
    <>
      {userDetails.connected ? (
        <div className="container">
          <ul className="member-list">
            <li
              className={`member ${tab === "Group" && "active"}`}
              onClick={() => setTab("Group")}
            >
              Group
            </li>
            {[...privateChats.keys()].map((name, index) => (
              <li
                key={index}
                onClick={() => setTab(name)}
                className={`member ${tab === name && "active"}`}
              >
                {name}
              </li>
            ))}
          </ul>
          {tab === "Group" && (
            <div className="chat-display">
              <ul>
                {publicChats.map((chat, index) => {
                  return (
                    <li key={index} className="msg-bubble">
                      {chat.senderName !== userDetails.userName && (
                        <p>{chat.senderName}</p>
                      )}
                      <div>{chat.message}</div>
                      {chat.senderName === userDetails.userName && (
                        <p className="self">-{chat.senderName}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="send-message">
                <input
                  type="text"
                  onChange={handleMessage}
                  value={userDetails.message}
                />
                <button onClick={onSendPublicMessage}>Send</button>
              </div>
            </div>
          )}
          {tab !== "Group" && (
            <div className="chat-display">
              <ul>
                {[...privateChats.get(tab)].map((chat, index) => {
                  return (
                    <li key={index} className="msg-bubble">
                      {chat.senderName !== userDetails.userName && (
                        <p>{chat.senderName}</p>
                      )}
                      <div>{chat.message}</div>
                      {chat.senderName === userDetails.userName && (
                        <p className="self">-{chat.senderName}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="send-message">
                <input
                  type="text"
                  onChange={handleMessage}
                  value={userDetails.message}
                />
                <button onClick={onSendPrivateMessage}>Send</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Register
          onChanges={handleChange}
          userName={userDetails.userName}
          onClicks={onClickHandler}
        />
      )}
    </>
  );
}
