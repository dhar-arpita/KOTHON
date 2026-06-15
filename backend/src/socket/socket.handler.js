const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Message = require('../models/Message.model');
const Room = require('../models/Room.model');

const onlineUsers = new Map();

module.exports = (io) => {

    //socket.io middleware to authenticate token during connection
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token required'));
        }
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decode.id;
            next();
        } catch {
            return next(new Error('Authentication error: Invalid token'));
        }
    });


    io.on('connection', async socket => {
        console.log('New client connected: ', socket.id);
        onlineUsers.set(socket.userId, socket.id);



        await User.findByIdAndUpdate(socket.userId, { isOnline: true });

        socket.on('joinRoom', async roomId => {
            socket.join(roomId);

            const messages = await Message.find({ room: roomId })
                .populate('sender', 'username avatar')
                .sort({ createdAt: 1 });

            socket.emit('loadMessages', messages);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        socket.on('leaveRoom', roomId => {
            socket.leave(roomId);
            console.log(`Socket ${socket.id} left room ${roomId}`);
        });



        socket.on("sendMessage", async (data) => {

            try {
                const { roomId, content, type } = data;
                const message = await Message.create(
                    {
                        sender: socket.userId,
                        room: roomId,
                        content: content,
                        type: type || 'text',
                        readBy: [socket.userId]

                    }
                );

                await Room.findByIdAndUpdate(roomId, {
                    lastMessage: message._id
                });

                const fullmessage = await message.populate('sender', 'username avatar');

                io.to(roomId).emit('newMessage', fullmessage);

            } catch (error) {
                console.error('Error sending message:', error);
            }
        });


        //io.to is for both sender and receiver to get the event. socket.to is only for receiver
        socket.on('typingIndicator', ({ roomId }) => {
            socket.to(roomId).emit('userTyping', { userId: socket.userId });
        });

        socket.on('stopTypingIndicator', ({ roomId }) => {
            socket.to(roomId).emit('userStopTyping', { userId: socket.userId });
        });

        socket.on('readRecipients', async data => {
            const { room } = data;

            const unreadMessages = await Message.find({
                room: room,
                readBy: { $ne: socket.userId }
            }).select('sender');

            await Message.updateMany(
                {
                    room: room,
                    readBy: { $ne: socket.userId }
                },

                {
                    $addToSet: { readBy: socket.userId },

                }
            );

            const roomInfo = await Room.findById(room);
            const roomMembers = roomInfo.members.length;

            await Message.updateMany(
                { room: room, $expr: { $eq: [{ $size: '$readBy' }, roomMembers] } },
                { $set: { status: 'read' } }
            );

            unreadMessages.forEach(msg => {
                const senderSocketId = onlineUsers.get(msg.sender.toString());
                if (senderSocketId) {
                    io.to(senderSocketId).emit('messagesRead', { room });
                }
            });




        });

        socket.on('disconnect', async () => {
            await User.findByIdAndUpdate(socket.userId, {
                isOnline: false,
                lastSeen: Date.now()
            });
            onlineUsers.delete(socket.userId);
            console.log('Client disconnected: ', socket.id);
        });

    });
};
