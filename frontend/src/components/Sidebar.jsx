import { useState, useEffect } from 'react';
import { roomAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Sidebar({ onRoomSelect, selectedRoom }) {
    const { user, logout } = useAuth();
    const [rooms, setRooms] = useState([]);
    const { socket } = useSocket();

    useEffect(() => {
        roomAPI.getMyChats()
            .then(res => setRooms(res.data.rooms))
            .catch(err => console.error(err));
    }, []);

   useEffect(() => {
    if (!socket) return;
    
    const handleNew = (msg) => {
        const msgRoom = msg.room._id || msg.room;
        setRooms(prev => prev.map(room => 
            room._id === msgRoom ? { ...room, lastMessage: msg } : room
        ));
    };
    
    socket.on('newMessage', handleNew);
    return () => socket.off('newMessage', handleNew);
}, [socket]);

    return (
        <div className="flex flex-col h-full bg-[#111b21]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#202c33]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-bold text-sm">
                        {user?.username?.[0].toUpperCase()}
                    </div>
                    <span className="text-[#e9edef] font-medium text-sm">{user?.username}</span>
                </div>
                <button onClick={logout} className="text-[#8696a0] hover:text-white text-xs">
                    Logout
                </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2 bg-[#111b21]">
                <div className="flex items-center gap-2 bg-[#202c33] rounded-lg px-3 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#8696a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search or start new chat"
                        className="bg-transparent text-sm outline-none flex-1 text-[#d1d7db] placeholder-[#8696a0]"
                    />
                </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto">
                {rooms.length === 0 && (
                    <p className="text-center text-[#8696a0] text-sm mt-8">No chats yet</p>
                )}
                {rooms.map(room => {
                    const otherMember = room.members.find(m => m.user._id !== user.id);
                    const isSelected = selectedRoom?._id === room._id;
                    return (
                        <div
                            key={room._id}
                            onClick={() => onRoomSelect(room)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#202c33] transition-colors
                                ${isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-bold flex-shrink-0">
                                {otherMember?.user.username[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm text-[#e9edef]">
                                        {otherMember?.nickname || otherMember?.user.username}
                                    </span>
                                    <span className="text-xs text-[#8696a0]">12:30</span>
                                </div>
                                <p className="text-xs text-[#8696a0] truncate mt-0.5">
                                    {room.lastMessage?.content || 'No messages yet'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation */}
            <div className="flex justify-around items-center py-3 bg-[#202c33] border-t border-[#2a3942]">
                <button className="flex flex-col items-center gap-1 text-xs text-[#00a884]">
                    <img src="/chats.svg" className="w-6 h-6 invert" />
                    <span>Chats</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-xs text-[#8696a0]">
                    <img src="/groups.svg" className="w-6 h-6 invert opacity-60" />
                    <span>Groups</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-xs text-[#8696a0]">
                    <img src="/settings.svg" className="w-6 h-6 invert opacity-60" />
                    <span>Settings</span>
                </button>
            </div>
        </div>
    );
}