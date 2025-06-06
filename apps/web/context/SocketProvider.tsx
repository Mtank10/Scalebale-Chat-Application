'use client'
import React, { useCallback, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

interface Message {
  text: string;
  username: string;
  timestamp: string;
  id: string;
}

interface SocketProviderProps {
  children?: React.ReactNode
}

interface ISocketContext {
  sendMessage: (msg: string, username: string) => any;
  messages: Message[];
  isConnected: boolean;
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error(`state is undefined`);
  return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const sendMessage: ISocketContext["sendMessage"] = useCallback((msg, username) => {
    console.log("Send message", msg);
    if (socket && isConnected) {
      socket.emit("event:message", { message: msg, username });
    }
  }, [socket, isConnected]);

  const onMessageRec = useCallback((msg: string) => {
    console.log('From Server Msg Rec', msg);
    try {
      const parsedMessage = JSON.parse(msg) as { message: string; username: string; timestamp: string; id: string };
      const newMessage: Message = {
        text: parsedMessage.message,
        username: parsedMessage.username,
        timestamp: parsedMessage.timestamp,
        id: parsedMessage.id
      };
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }, []);

  const onConnect = useCallback(() => {
    console.log('Connected to server');
    setIsConnected(true);
  }, []);

  const onDisconnect = useCallback(() => {
    console.log('Disconnected from server');
    setIsConnected(false);
  }, []);

  useEffect(() => {
    const _socket = io('http://localhost:8000');
    
    _socket.on('connect', onConnect);
    _socket.on('disconnect', onDisconnect);
    _socket.on('message', onMessageRec);
    
    setSocket(_socket);

    return () => {
      _socket.off('connect', onConnect);
      _socket.off('disconnect', onDisconnect);
      _socket.off('message', onMessageRec);
      _socket.disconnect();
      setSocket(undefined);
    }
  }, [onConnect, onDisconnect, onMessageRec]);

  return (
    <SocketContext.Provider value={{ sendMessage, messages, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}