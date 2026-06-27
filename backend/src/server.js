require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const connectDB = require('./config/db');
connectDB();

const authRoutes = require('./routes/auth.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const userRoutes = require('./routes/user.routes');
const roomRoutes = require('./routes/room.routes');


const app = express();

// ─── Security & logging ────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body parsing ──────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));


// ─── Health check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

// ─── Routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/room',roomRoutes);



// ─── Error handling (সবার শেষে) ───────────────────────
app.use(notFound);
app.use(errorHandler);



//socket.io set up

const http = require('http')
const { Server } = require('socket.io');

const server = http.createServer(app); //wrapping express app with http server




const io = new Server(server,{
  cors:{origin:process.env.CLIENT_URL || '*'}
})
app.set('io', io);

const initSocket = require('./socket/socket.handler');
initSocket(io);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = { app, io };