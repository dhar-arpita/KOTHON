import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user) return; // login না থাকলে connect করবে না

        const token = localStorage.getItem('token');
        const newSocket = io('http://localhost:5000', {
            auth: { token }
        });

        setSocket(newSocket);

        return () => newSocket.disconnect(); // cleanup
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);