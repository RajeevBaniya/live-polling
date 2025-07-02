import React, { useState, useEffect, useRef } from "react";
import { Button, Popover, OverlayTrigger, Tab, Nav } from "react-bootstrap";
import Chat from "./Chat";
import { io } from "socket.io-client";
import "./Chat.css";
import chatIcon from "../../assets/chat.svg";
import { API_BASE_URL } from "../../config";

const socket = io(API_BASE_URL);

const ChatPopover = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [participants, setParticipants] = useState([]);
  const chatWindowRef = useRef(null);
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
    const username = sessionStorage.getItem("username");
    if (username) {
      console.log("Joining chat as:", username);
      socket.emit("joinChat", { username });
    } else {
      console.log("No username found in session storage");
    }

    socket.on("chatMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    socket.on("participantsUpdate", (participantsList) => {
      console.log("Participants updated:", participantsList);
      setParticipants(participantsList);
    });
    return () => {
      socket.off("participantsUpdate");
      socket.off("chatMessage");
    };
  }, []);
  const username = sessionStorage.getItem("username");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = { user: username, text: newMessage };
      socket.emit("chatMessage", message);
      setNewMessage("");
    }
  };
  const handleKickOut = (participant) => {
    console.log("Kicking out participant:", participant);
    // Emit the kickOut event with additional data to ensure it's processed
    socket.emit("kickOut", {
      username: participant,
      kickedBy: sessionStorage.getItem("username"),
      timestamp: new Date().toISOString(),
    });

    // Show confirmation to teacher
    alert(`${participant} has been kicked out.`);
  };

  const participantsTab = (
    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
      {participants.length === 0 ? (
        <div className="p-3 text-center">No participants connected</div>
      ) : (
        <table className="participants-table">
          <thead>
            <tr>
              <th>Name</th>
              {username && username.startsWith("teacher") ? (
                <th>Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, index) => (
              <tr key={index}>
                <td>{participant}</td>
                {username &&
                username.startsWith("teacher") &&
                participant !== username ? (
                  <td>
                    <button
                      onClick={() => handleKickOut(participant)}
                      className="kick-button"
                    >
                      Kick Out
                    </button>
                  </td>
                ) : username && username.startsWith("teacher") ? (
                  <td>
                    <span className="text-muted">(You)</span>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const popover = (
    <Popover
      id="chat-popover"
      style={{ width: "400px", height: "400px", fontSize: "12px" }}
    >
      <Popover.Body style={{ height: "100%" }}>
        <Tab.Container defaultActiveKey="chat">
          <Nav variant="underline">
            <Nav.Item>
              <Nav.Link className="tab-item message-form" eventKey="chat">
                Chat
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className="tab-item" eventKey="participants">
                Participants
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content className="mt-3">
            <Tab.Pane eventKey="chat">
              <Chat
                messages={messages}
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="participants">{participantsTab}</Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement="left"
      overlay={popover}
      rootClose
    >
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px",
          background: "rgba(90, 102, 209, 1)",
          borderRadius: "100%",
          cursor: "pointer",
        }}
      >
        <img
          style={{ width: "30px", height: "30px" }}
          src={chatIcon}
          alt="chat icon"
        />
      </div>
    </OverlayTrigger>
  );
};

export default ChatPopover;
