import { useState, useEffect } from 'react';
import { roomAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function GroupInfo({ room, onClose, onExit, onRoomUpdate }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [showAddMember, setShowAddMember] = useState(false);
    const [addSearch, setAddSearch] = useState('');
    const [addSearchResults, setAddSearchResults] = useState([]);

    const myId = user._id || user.id;
    const myMembership = room.members.find(m => m.user._id === myId);
    const isAdmin = myMembership?.isAdmin;
    const canAddMember = room.isPublic || isAdmin;

    useEffect(() => {
        if (!addSearch.trim()) {
            setAddSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            userAPI.search(addSearch)
                .then(res => {
                    const existingIds = room.members.map(m => m.user._id);
                    setAddSearchResults(res.data.users.filter(u => !existingIds.includes(u._id)));
                })
                .catch(err => console.error(err));
        }, 300);
        return () => clearTimeout(timer);
    }, [addSearch, room.members]);

    const doExit = async () => {
        setLoading(true);
        try {
            await roomAPI.exitGroup({ roomId: room._id });
            onExit();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setConfirmAction(null);
        }
    };

    const doRemove = async (memberId) => {
        setLoading(true);
        try {
            const res = await roomAPI.removeMember({ roomId: room._id, userId: memberId });
            onRoomUpdate(res.data.room);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setConfirmAction(null);
        }
    };

    const handleMakeAdmin = async (memberId) => {
        setLoading(true);
        try {
            const res = await roomAPI.makeAdmin({ roomId: room._id, userId: memberId });
            onRoomUpdate(res.data.room);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (clickedUser) => {
        setLoading(true);
        try {
            const res = await roomAPI.addMember({ roomId: room._id, userId: clickedUser._id });
            onRoomUpdate(res.data.room);
            setAddSearch('');
            setAddSearchResults([]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#111b21] rounded-lg w-full max-w-sm max-h-[80vh] overflow-y-auto relative">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#202c33]">
                    <span className="text-[#e9edef] font-medium">Group Info</span>
                    <button onClick={onClose} className="text-[#8696a0] hover:text-white">✕</button>
                </div>

                {/* Group identity */}
                <div className="flex flex-col items-center py-6 border-b border-[#202c33]">
                    <div className="w-20 h-20 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-bold text-2xl mb-3">
                        {room.name?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-[#e9edef] font-medium">{room.name}</p>
                    <p className="text-xs text-[#8696a0] mt-1">{room.members.length} members</p>
                </div>

                {/* Add member section (admin only) */}
                {canAddMember && (
                    <div className="px-4 py-3 border-b border-[#202c33]">
                        <button
                            onClick={() => setShowAddMember(!showAddMember)}
                            className="w-full text-sm text-[#00a884] border border-[#00a884] py-2 rounded-lg"
                        >
                            {showAddMember ? 'Cancel' : '+ Add Member'}
                        </button>

                        {showAddMember && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    placeholder="Search users to add"
                                    value={addSearch}
                                    onChange={(e) => setAddSearch(e.target.value)}
                                    className="w-full bg-[#202c33] text-[#d1d7db] rounded-lg px-3 py-2 text-sm outline-none mb-2"
                                />
                                {addSearchResults.length > 0 ? (
                                    addSearchResults.map(u => (
                                        <div
                                            key={u._id}
                                            onClick={() => !loading && handleAddMember(u)}
                                            className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-[#2a3942] rounded"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[#6b7c85] flex items-center justify-center text-white text-xs font-bold">
                                                {u.username[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm text-[#e9edef]">{u.username}</span>
                                        </div>
                                    ))
                                ) : addSearch.trim() && (
                                    <p className="text-xs text-[#8696a0] text-center py-2">No users found</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Member list */}
                <div className="px-2 py-2">
                    {room.members.map(m => (
                        <div key={m.user._id} className="flex items-center justify-between px-3 py-2 hover:bg-[#202c33] rounded">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-bold text-sm">
                                    {m.user.username?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm text-[#e9edef]">
                                        {m.user._id === myId ? 'You' : m.user.username}
                                    </p>
                                    {m.isAdmin && (
                                        <p className="text-xs text-[#00a884]">Admin</p>
                                    )}
                                </div>
                            </div>

                            {isAdmin && m.user._id !== myId && (
                                <div className="flex gap-2">
                                    {!m.isAdmin && (
                                        <button
                                            disabled={loading}
                                            onClick={() => handleMakeAdmin(m.user._id)}
                                            className="text-xs text-[#00a884] border border-[#00a884] px-2 py-1 rounded"
                                        >
                                            Make Admin
                                        </button>
                                    )}
                                    <button
                                        disabled={loading}
                                        onClick={() => setConfirmAction({
                                            type: 'remove',
                                            memberId: m.user._id,
                                            memberName: m.user.username
                                        })}
                                        className="text-xs text-red-400 border border-red-400 px-2 py-1 rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Exit button */}
                <div className="px-4 py-4 border-t border-[#202c33]">
                    <button
                        disabled={loading}
                        onClick={() => setConfirmAction({ type: 'exit' })}
                        className="w-full py-2.5 text-red-400 border border-red-400 rounded-lg text-sm font-medium"
                    >
                        Exit Group
                    </button>
                </div>

                {/* Custom confirm overlay */}
                {confirmAction && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                        <div className="bg-[#202c33] rounded-lg p-5 w-[85%] max-w-xs">
                            <p className="text-[#e9edef] text-sm mb-4">
                                {confirmAction.type === 'exit'
                                    ? 'Are you sure you want to leave this group?'
                                    : `Remove ${confirmAction.memberName} from the group?`}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    disabled={loading}
                                    className="flex-1 py-2 text-sm text-[#8696a0] border border-[#8696a0] rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        confirmAction.type === 'exit'
                                            ? doExit()
                                            : doRemove(confirmAction.memberId);
                                    }}
                                    disabled={loading}
                                    className="flex-1 py-2 text-sm bg-red-500 text-white rounded-lg"
                                >
                                    {loading ? '...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}