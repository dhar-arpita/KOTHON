import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';


export default function ChatWindow({ room, onBack }) {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
    if (!room || !socket) return;
    socket.emit('joinRoom', room._id);
    
    const handleLoad = (msgs) => setMessages(msgs);
    const handleNew = (msg) => {
        setMessages(prev => [...prev.filter(m => !m.pending), msg]);
    };
    
    socket.on('loadMessages', handleLoad);
    socket.on('newMessage', handleNew);

    return () => {
        socket.emit('leaveRoom', room._id);
        socket.off('loadMessages', handleLoad);
        socket.off('newMessage', handleNew);
    };
}, [room, socket]);

    useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, [messages]);

    if (!room) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-[#f0f2f5]">
                <div className="text-7xl mb-4">💬</div>
                <p className="text-xl font-light text-gray-600">Kothon</p>
                <p className="text-sm text-gray-400 mt-2">Select a chat to start messaging</p>
            </div>
        );
    }

    const otherMember = room.members.find(m => m.user._id !== user.id);
    const chatName = room.isGroup ? room.name : (otherMember?.nickname || otherMember?.user.username);

    const sendMessage = () => {
        if (!content.trim()) return;

        // আগে UI তে দেখাও (instant!)
        const tempMessage = {
            _id: Date.now(),
            sender: { _id: user.id, username: user.username },
            content,
            createdAt: new Date(),
            pending: true
        };
        setMessages(prev => [...prev, tempMessage]);

        // তারপর server এ পাঠাও
        socket.emit('sendMessage', { roomId: room._id, content, type: 'text' });
        setContent('');

    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33] shadow-sm">
                <button onClick={onBack} className="md:hidden text-[#e9edef] text-xl">
                    <img src="/back.svg" className='w-6 h-6' />
                </button>
                <div className="w-10 h-10 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-bold text-sm">
                    {chatName?.[0].toUpperCase()}
                </div>

                <div>
                    <p className="font-medium text-[#e9edef] text-sm">{chatName}</p>
                    <p className="text-xs text-[#8696a0]">
                        {otherMember?.user.isOnline ? 'online' : 'offline'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto px-6 py-4"
                style={{ backgroundColor: '#efeae2' }}
            >
                {messages.length === 0 && (
                    <div className="flex justify-center mt-4">
                        <span className="text-xs text-[#667781] bg-white px-4 py-1.5 rounded-full shadow-sm">
                            No messages yet
                        </span>
                    </div>
                )}
                {messages.map(msg => {
                    const isMe = msg.sender._id === user.id;
                    return (
                        <div key={msg._id} className={`flex mb-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-sm px-3 py-2 rounded-lg text-sm shadow-sm relative
                                ${isMe ? 'bg-[#d9fdd3] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}
                            >
                                <p className="leading-relaxed">{msg.content}</p>
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-[#667781]' : 'text-[#667781]'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && <span className="ml-1">✓✓</span>}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
                </div>
                {/* Input */}
                <div className="flex items-center gap-2 px-3 py-2 bg-[#202c33]">
                    <button className="text-[#8696a0] hover:text-white transition-colors p-2">
                        <img src="/plus.svg" className="w-6 h-6" />
                    </button>

                    <div className="flex-1 flex items-center bg-[#2a3942] rounded-lg px-4 py-2.5 gap-2">
                        <input
                            type="text"
                            placeholder="Type a message"
                            className="flex-1 bg-transparent text-sm outline-none text-[#d1d7db] placeholder-[#8696a0]"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button className="text-[#8696a0] hover:text-white">
                            <img src="/emoji.svg" className="w-5 h-5 opacity-70" />
                        </button>
                    </div>

                    {content.trim() ? (
                        <button onClick={sendMessage} className="bg-[#00a884] p-2.5 rounded-full hover:bg-[#02bf97] transition-colors">
                            <img src="/send.png" className="w-5 h-5" />
                        </button>
                    ) : (
                        <button className="bg-[#00a884] p-2.5 rounded-full">
                            <img src="/mic.svg" className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
            );
}