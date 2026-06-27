import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import GroupInfo from './GroupInfo';

export default function ChatWindow({ room, onBack, onRoomUpdate }) {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const messagesEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const [showGroupInfo, setShowGroupInfo] = useState(false);

    const myId = user?._id || user?.id;

    useEffect(() => {
        if (!room || !socket) return;
        socket.emit('joinRoom', room._id);

        const handleLoad = (msgs) => setMessages(msgs);
        const handleNew = (msg) => {
            setMessages(prev => [...prev.filter(m => !m.pending), msg]);
        };

        const handleGroupUpdate = (updatedRoom) => {
            if (updatedRoom._id === room._id) {
                onRoomUpdate(updatedRoom);
            }
        };

        const handleMemberLeft = ({ roomId, userId }) => {
            if (roomId === room._id && userId === myId) {
                onBack();
            }
        };

        socket.on('loadMessages', handleLoad);
        socket.on('newMessage', handleNew);
        socket.on('groupUpdated', handleGroupUpdate);
        socket.on('memberLeft', handleMemberLeft);
        socket.on('userTyping', () => setIsTyping(true));
        socket.on('userStopTyping', () => setIsTyping(false));

        return () => {
            socket.emit('leaveRoom', room._id);
            socket.off('loadMessages', handleLoad);
            socket.off('newMessage', handleNew);
            socket.off('groupUpdated', handleGroupUpdate);
            socket.off('memberLeft', handleMemberLeft);
            socket.off('userTyping');
            socket.off('userStopTyping');
        };
    }, [room, socket, myId]);

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

    const otherMember = !room.isGroup
        ? room.members.find(m => m.user._id !== myId)
        : null;

    const chatName = room.isGroup ? room.name : (otherMember?.nickname || otherMember?.user.username);

    const statusText = room.isGroup
        ? `${room.members.length} members`
        : (otherMember?.user.isOnline ? 'online' : 'offline');

    const sendMessage = () => {
        if (!content.trim()) return;

        const tempMessage = {
            _id: Date.now(),
            sender: { _id: myId, username: user.username },
            content,
            createdAt: new Date(),
            pending: true
        };
        setMessages(prev => [...prev, tempMessage]);

        socket.emit('sendMessage', { roomId: room._id, content, type: 'text' });
        socket.emit('stopTypingIndicator', { roomId: room._id });
        setContent('');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div
                className="flex items-center gap-3 px-4 py-3 bg-[#202c33] shadow-sm cursor-pointer"
                onClick={() => room.isGroup && setShowGroupInfo(true)}
            >
                <button onClick={onBack} className="md:hidden text-[#e9edef] text-xl">
                    <img src="/back.svg" className='w-6 h-6' />
                </button>
                <div className="w-10 h-10 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-bold text-sm">
                    {chatName?.[0]?.toUpperCase()}
                </div>
                <div>
                    <p className="font-medium text-[#e9edef] text-sm">{chatName}</p>
                    <p className="text-xs text-[#8696a0]">{statusText}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 overflow-x-hidden" style={{ backgroundColor: '#efeae2' }}>
                {messages.length === 0 && (
                    <div className="flex justify-center mt-4">
                        <span className="text-xs text-[#667781] bg-white px-4 py-1.5 rounded-full shadow-sm">
                            No messages yet
                        </span>
                    </div>
                )}
                {messages.map(msg => {
                    const isMe = msg.sender._id === myId;
                    const showSenderInfo = room.isGroup && !isMe;

                    return (
                        <div key={msg._id} className={`flex mb-1.5 gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {showSenderInfo && (
                                <div className="w-7 h-7 rounded-full bg-[#6b7c85] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 self-end">
                                    {msg.sender.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm shadow-sm relative break-all
                                ${isMe ? 'bg-[#d9fdd3] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                                {showSenderInfo && (
                                    <p className="text-xs font-semibold mb-0.5" style={{ color: '#00a884' }}>
                                        {msg.sender.username}
                                    </p>
                                )}
                                <p className="leading-relaxed">{msg.content}</p>
                                <p className="text-[10px] mt-1 text-right text-[#667781]">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && <span className="ml-1">✓✓</span>}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {isTyping && (
                <div className="px-4 py-1" style={{ backgroundColor: '#efeae2' }}>
                    <div className="inline-flex items-center gap-1.5 bg-'#adada9 px-3 py-2 rounded-lg rounded-tl-none shadow-sm">
                        <p className='text-[#8696a0] text-sm'>typing</p>
                        <span className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#202c33] h-16">
                <button className="text-[#8696a0] hover:text-white transition-colors p-2">
                    <img src="/plus.png" className="w-6 h-6" />
                </button>
                <div className="flex-1 flex items-center bg-[#2a3942] rounded-lg px-4 py-2.5 gap-2">
                    <input
                        type="text"
                        placeholder="Type a message"
                        className="flex-1 bg-transparent text-sm outline-none text-[#d1d7db] placeholder-[#8696a0]"
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            if (e.target.value === '') {
                                socket.emit('stopTypingIndicator', { roomId: room._id });
                                clearTimeout(typingTimeoutRef.current);
                                return;
                            }
                            socket.emit('typingIndicator', { roomId: room._id });
                            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                            typingTimeoutRef.current = setTimeout(() => {
                                socket.emit('stopTypingIndicator', { roomId: room._id });
                            }, 10000);
                        }}
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

            {/* Group Info Modal */}
            {showGroupInfo && (
                <GroupInfo
                    room={room}
                    onClose={() => setShowGroupInfo(false)}
                    onExit={() => {
                        setShowGroupInfo(false);
                        onBack();
                    }}
                    onRoomUpdate={(updatedRoom) => {
                        onRoomUpdate(updatedRoom);
                    }}
                />
            )}
        </div>
    );
}