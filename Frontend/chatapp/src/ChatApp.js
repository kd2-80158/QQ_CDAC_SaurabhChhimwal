import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import './ChatApp.css'; // Import CSS file for styling

const url = 'http://localhost:3001/api'; // Your backend API base URL
const socket = socketIOClient(url); // Initialize WebSocket client

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [seenMessage, setSeenMessage] = useState(null);
  const messageContainerRef = useRef(null);

  useEffect(() => {
    if (senderName.trim() !== '' && recipientName.trim() !== '') {
      // Fetch messages only when sender and recipient names are set
      fetchMessages();
    }

    if (socket.connected) {
      // Subscribe to WebSocket events
      socket.on('newMessage', (newMessage) => {
        setMessages([...messages, newMessage]);
      });
    }

    return () => {
      // Clean up WebSocket subscription
      socket.off('newMessage');
    };
  }, [socket, senderName, recipientName]); // Depend on socket, senderName, and recipientName for re-fetching messages

  useEffect(() => {
    // Scroll to the bottom of the message container on new messages
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${url}/messages`);
      // Filter messages based on sender and recipient names
      const filteredMessages = response.data.filter(
        (msg) => msg.sender === senderName && msg.recipient === recipientName
      );
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (text.trim() !== '' && senderName.trim() !== '' && recipientName.trim() !== '') {
      try {
        const response = await axios.post(`${url}/messages`, {
          text,
          sender: senderName,
          recipient: recipientName,
        });
        setMessages([...messages, response.data]); // Add the new message to the messages array
        setText(''); // Clear the input box
        if (socket.connected) {
          socket.emit('newMessage', response.data); // Send new message event via WebSocket
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleSeenMessage = (messageId) => {
    setSeenMessage(messageId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Set sender and recipient names and clear the input fields
    setSenderName(e.target.sender.value);
    setRecipientName(e.target.recipient.value);
    setText('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>ChatPro</h1>
      </div>
      {senderName.trim() !== '' && recipientName.trim() !== '' && ( // Only render the chat if sender and recipient names are set
        <div className="chat-screen">
          <div className="message-container" ref={messageContainerRef}>
            {messages && messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.id === seenMessage ? 'seen' : ''}`}>
                  <span className={msg.sender === senderName ? 'sent' : 'received'}>
                    {msg.sender === senderName ? 'You: ' : `${msg.sender === recipientName ? `${recipientName}: ` : ''}`}
                  </span>
                  <span>{msg.text}</span>
                  {msg.sender === senderName && <span className="tick-mark">&#10003;</span>} {/* Display tick mark for sent messages */}
                  <button onClick={() => handleSeenMessage(msg.id)}>✓</button> {/* Seen indicator */}
                </div>
              ))
            ) : (
              <p>No messages available</p>
            )}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="message-input"
            />
            <button onClick={sendMessage} className="send-button">Send</button>
          </div>
        </div>
      )}
      {senderName.trim() === '' || recipientName.trim() === '' ? ( // Show form to enter sender and recipient names if not set
        <div className="input-form">
          <form onSubmit={handleSubmit}>
            <label htmlFor="sender">Sender Name:</label>
            <input
              type="text"
              id="sender"
              defaultValue={senderName}
              required
            />
            <br></br>
            <br></br>
            <label htmlFor="recipient">Recipient Name:</label>
            <input
              type="text"
              id="recipient"
              defaultValue={recipientName}
              required
            />
            <br></br>
            <button type="submit">Start Chat</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export default ChatApp;
