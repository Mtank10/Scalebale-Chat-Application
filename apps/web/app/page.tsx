'use client'
import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketProvider'
import styles from './page.module.css'

export default function Page() {
  const { sendMessage, messages, isConnected } = useSocket();
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && username.trim()) {
      sendMessage(message, username);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!isUsernameSet) {
        handleSetUsername();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleSetUsername = () => {
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  if (!isUsernameSet) {
    return (
      <div className={styles.container}>
        <div className={styles.usernameModal}>
          <h2>Welcome to Chat App</h2>
          <p>Please enter your username to continue</p>
          <div className={styles.usernameForm}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your username"
              className={styles.usernameInput}
              maxLength={20}
            />
            <button 
              onClick={handleSetUsername}
              className={styles.joinButton}
              disabled={!username.trim()}
            >
              Join Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h1>Chat Application</h1>
          <div className={styles.connectionStatus}>
            <span className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`${styles.messageItem} ${msg.username === username ? styles.ownMessage : styles.otherMessage}`}>
                <div className={styles.messageHeader}>
                  <span className={styles.username}>{msg.username}</span>
                  <span className={styles.timestamp}>{msg.timestamp}</span>
                </div>
                <div className={styles.messageText}>{msg.text}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputContainer}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className={styles.messageInput}
            disabled={!isConnected}
          />
          <button 
            onClick={handleSendMessage}
            className={styles.sendButton}
            disabled={!message.trim() || !isConnected}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}