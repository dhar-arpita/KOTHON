import { useState, useEffect } from 'react';
import { roomAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Sidebar({ onRoomSelect, selectedRoom }) {
    const { user, logout } = useAuth();
    const [rooms, setRooms] = useState([]);
    const { socket } = useSocket();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('chats');
    const [groupSearch, setGroupSearch] = useState('');
    const [groupSearchResults, setGroupSearchResults] = useState([]);

    const myId = user?._id || user?.id;

    useEffect(() => {
        roomAPI.getMyChats()
            .then(res => setRooms(res.data.rooms))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNew = (msg) => {
            const msgRoom = msg.room._id || msg.room;
            setRooms(prev => {
                const exists = prev.find(r => r._id === msgRoom);
                if (exists) {
                    return prev.map(room =>
                        room._id === msgRoom ? { ...room, lastMessage: msg } : room
                    );
                } else {
                    roomAPI.getMyChats()
                        .then(res => setRooms(res.data.rooms));
                    return prev;
                }
            });
        };

        const handleGroupUpdate = (updatedRoom) => {
            setRooms(prev => {
                const exists = prev.find(r => r._id === updatedRoom._id);
                if (exists) {
                    return prev.map(room =>
                        room._id === updatedRoom._id ? updatedRoom : room
                    );
                } else {
                    // notun group e add hoyechi, list e ekhono nei tai fresh fetch koro
                    roomAPI.getMyChats()
                        .then(res => setRooms(res.data.rooms));
                    return prev;
                }
            });
        };

        const handleMemberLeft = ({ roomId, userId }) => {
            // jodi ami nije exit kori, ei room sidebar theke shorie dao
            if (userId === myId) {
                setRooms(prev => prev.filter(r => r._id !== roomId));
            }
        };

        socket.on('newMessage', handleNew);
        socket.on('groupUpdated', handleGroupUpdate);
        socket.on('memberLeft', handleMemberLeft);

        return () => {
            socket.off('newMessage', handleNew);
            socket.off('groupUpdated', handleGroupUpdate);
            socket.off('memberLeft', handleMemberLeft);
        };
    }, [socket, myId]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            userAPI.search(searchQuery)
                .then(res => setSearchResults(res.data.users))
                .catch(err => console.error(err));
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (!groupSearch.trim()) {
            setGroupSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            userAPI.search(groupSearch)
                .then(res => setGroupSearchResults(res.data.users))
                .catch(err => console.error(err));
        }, 300);
        return () => clearTimeout(timer);
    }, [groupSearch]);

    const handleSearchClick = async (clickedUser) => {
        const res = await roomAPI.getOrCreate({ user: clickedUser._id });
        onRoomSelect(res.data.room);
        setSearchQuery('');
        setSearchResults([]);
        const roomsRes = await roomAPI.getMyChats();
        setRooms(roomsRes.data.rooms);
    };

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
                <div className="flex gap-2">
                    {activeTab === 'groups' && (
                        <button onClick={() => setShowGroupForm(true)} className="text-[#00a884] text-xs border border-[#00a884] px-2 py-1 rounded">
                            + New Group
                        </button>
                    )}
                    <button onClick={logout} className="text-[#8696a0] hover:text-white text-xs">
                        Logout
                    </button>
                </div>
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto">
                {showGroupForm ? (
                    <div className="p-4">
                        <input
                            type="text"
                            placeholder="Group name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full bg-[#202c33] text-[#d1d7db] rounded-lg px-3 py-2 text-sm outline-none mb-3"
                        />
                        <input
                            type="text"
                            placeholder="Search members to add"
                            value={groupSearch}
                            onChange={(e) => setGroupSearch(e.target.value)}
                            className="w-full bg-[#202c33] text-[#d1d7db] rounded-lg px-3 py-2 text-sm outline-none mb-3"
                        />

                        {selectedMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedMembers.map(m => (
                                    <span key={m._id} className="bg-[#00a884] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        {m.username}
                                        <button onClick={() => setSelectedMembers(prev => prev.filter(p => p._id !== m._id))}>✕</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {groupSearchResults.map(u => (
                            <div key={u._id} onClick={() => {
                                if (!selectedMembers.find(m => m._id === u._id)) {
                                    setSelectedMembers(prev => [...prev, u]);
                                }
                            }} className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-[#202c33] rounded">
                                <div className="w-8 h-8 rounded-full bg-[#6b7c85] flex items-center justify-center text-white text-xs font-bold">
                                    {u.username[0].toUpperCase()}
                                </div>
                                <span className="text-sm text-[#e9edef]">{u.username}</span>
                            </div>
                        ))}

                        <div className="flex gap-2 mt-3">
                            <button onClick={() => {
                                setShowGroupForm(false);
                                setGroupName('');
                                setSelectedMembers([]);
                                setSearchQuery('');
                            }} className="flex-1 py-2 text-sm text-[#8696a0] border border-[#8696a0] rounded-lg">
                                Cancel
                            </button>
                            <button onClick={async () => {
                                if (!groupName || selectedMembers.length < 2) return;
                                const res = await roomAPI.createGroup({
                                    name: groupName,
                                    members: selectedMembers.map(m => m._id),
                                    isPublic: false
                                });
                                onRoomSelect(res.data.room);
                                setShowGroupForm(false);
                                setGroupName('');
                                setSelectedMembers([]);
                                setSearchQuery('');
                                const roomsRes = await roomAPI.getMyChats();
                                setRooms(roomsRes.data.rooms);
                            }} className="flex-1 py-2 text-sm bg-[#00a884] text-white rounded-lg">
                                Create Group
                            </button>
                        </div>
                    </div>
                ) : searchQuery.trim() ? (
                    searchResults.length > 0 ? (
                        searchResults.map(u => (
                            <div key={u._id} onClick={() => handleSearchClick(u)} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#202c33]">
                                <div className="w-12 h-12 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-bold">
                                    {u.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm text-[#e9edef]">{u.username}</p>
                                    <p className="text-xs text-[#8696a0]">{u.mobileNo}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-[#8696a0] text-sm mt-8">No users found</p>
                    )
                ) : (
                    rooms
                        .filter(room => activeTab === 'chats' ? !room.isGroup : room.isGroup)
                        .map(room => {
                            const otherMember = room.members.find(m => m.user._id !== myId);
                            const isSelected = selectedRoom?._id === room._id;
                            return (
                                <div
                                    key={room._id}
                                    onClick={() => onRoomSelect(room)}
                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#202c33] transition-colors
                                ${isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'}`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {room.isGroup
                                            ? room.name?.[0]?.toUpperCase()
                                            : otherMember?.user?.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-sm text-[#e9edef]">
                                                {room.isGroup
                                                    ? room.name
                                                    : (otherMember?.nickname || otherMember?.user?.username || 'Unknown')}
                                            </span>
                                            <span className="text-xs text-[#8696a0]">
                                                {room.lastMessage?.createdAt
                                                    ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#8696a0] truncate mt-0.5">
                                            {room.lastMessage?.content || 'No messages yet'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-around items-center py-3 bg-[#202c33] border-t border-[#2a3942] h-16">
                <button onClick={() => setActiveTab('chats')}
                    className={`flex flex-col items-center gap-1 text-xs ${activeTab === 'chats' ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>
                    <img src="/chats.svg" className="w-6 h-6 invert" />
                    <span>Chats</span>
                </button>
                <button onClick={() => setActiveTab('groups')}
                    className={`flex flex-col items-center gap-1 text-xs ${activeTab === 'groups' ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>
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