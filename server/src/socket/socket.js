const { Server } = require('socket.io');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // Each user joins their own room by userId
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };
