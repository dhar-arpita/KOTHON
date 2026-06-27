const Room = require('../models/Room.model');
const mongoose = require('mongoose');

exports.getOrCreateInbox = async (req, res, next) => {
    try {
        const { user: userId } = req.body;
        const myId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID required' });
        }

        if (myId === userId) {
            return res.status(400).json({ message: 'Cannot chat with yourself' });
        }

        let room = await Room.findOne({
            isGroup: false,
            $and: [
                { 'members.user': new mongoose.Types.ObjectId(myId) },
                { 'members.user': new mongoose.Types.ObjectId(userId) },
                { members: { $size: 2 } }
            ]
        }).populate('members.user', 'username avatar isOnline');

        if (!room) {
            room = await Room.create({
                isGroup: false,
                members: [
                    { user: myId },
                    { user: userId }
                ]
            });
            room = await room.populate('members.user', 'username avatar isOnline');
        }

        res.json({ room });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyChats = async (req, res, next) => {
    try {
        const rooms = await Room.find({
            'members.user': req.user.id
        })
            .populate('members.user', 'username avatar isOnline')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json({ rooms });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.createGroup = async (req, res, next) => {
    try {
        const { name, members, isPublic } = req.body;
        const creator = req.user.id;

        if (!name) {
            return res.status(400).json({ message: 'Group name required' });
        }

        if (!members || members.length < 2) {
            return res.status(400).json({ message: 'Minimum 2 members are required' });
        }

        const allmembers = [
            { user: creator, isAdmin: true },
            ...members.map(id => ({ user: id, isAdmin: false }))
        ];

        let group = await Room.create({
            name,
            members: allmembers,
            isPublic: isPublic || false,
            isGroup: true

        });

        await group.populate('members.user', 'username avatar isOnline');
        res.status(201).json({ room: group });



    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.exitGroup = async (req, res) => {
    try {
        const { roomId } = req.body;
        const userId = req.user.id;

        const room = await Room.findById(roomId);
        if (!room || !room.isGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const isMember = room.members.some(m => m.user.toString() === userId);
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        room.members = room.members.filter(m => m.user.toString() !== userId);


        if (room.members.length === 0) {
            await Room.findByIdAndDelete(roomId);
            return res.json({ message: 'Left group, group deleted (no members left)' });
        }


        const hasAdmin = room.members.some(m => m.isAdmin);
        if (!hasAdmin) {
            room.members[0].isAdmin = true;
        }

        await room.save();
        await room.populate('members.user', 'username avatar isOnline'); 

        const io = req.app.get('io');
        io.to(roomId).emit('groupUpdated', room);  
        io.to(roomId).emit('memberLeft', { roomId, userId });  
        res.json({ message: 'Left group successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { roomId, userId } = req.body;
        const myId = req.user.id;

        const room = await Room.findById(roomId);
        if (!room || !room.isGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const me = room.members.find(m => m.user.toString() === myId);
        if (!me || !me.isAdmin) {
            return res.status(403).json({ message: 'Only admins can remove members' });
        }

        if (userId === myId) {
            return res.status(400).json({ message: 'Use exit group instead' });
        }

        room.members = room.members.filter(m => m.user.toString() !== userId);
        await room.save();
        await room.populate('members.user', 'username avatar isOnline');

        const io = req.app.get('io');
        io.to(roomId).emit('groupUpdated', room);

        res.json({ room });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.makeAdmin = async (req, res) => {
    try {
        const { roomId, userId } = req.body;
        const myId = req.user.id;

        const room = await Room.findById(roomId);
        if (!room || !room.isGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const me = room.members.find(m => m.user.toString() === myId);
        if (!me || !me.isAdmin) {
            return res.status(403).json({ message: 'Only admins can promote members' });
        }

        const target = room.members.find(m => m.user.toString() === userId);
        if (!target) {
            return res.status(404).json({ message: 'Member not found in this group' });
        }

        room.members.forEach(m => {
            m.isAdmin = false;
        });
        target.isAdmin = true;
        await room.save();
        await room.populate('members.user', 'username avatar isOnline');

        const io = req.app.get('io');
        io.to(roomId).emit('groupUpdated', room);

        res.json({ room });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { roomId, userId } = req.body;
        const myId = req.user.id;

        const room = await Room.findById(roomId);
        if (!room || !room.isGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const me = room.members.find(m => m.user.toString() === myId);
        if (!me || (!room.isPublic && !me.isAdmin)) {
            return res.status(403).json({ message: 'Only admins can add members' });
        }

        const alreadyMember = room.members.some(m => m.user.toString() === userId);
        if (alreadyMember) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        room.members.push({ user: userId, isAdmin: false });
        await room.save();
        await room.populate('members.user', 'username avatar isOnline');

        const io = req.app.get('io');
        io.to(roomId).emit('groupUpdated', room);

        res.json({ room });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};