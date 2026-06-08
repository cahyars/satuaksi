const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join-user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`👤 User joined room: user:${userId}`);
    });

    // Join roles room (e.g., ADMIN)
    socket.on('join-role', (role) => {
      socket.join(`role:${role}`);
      console.log(`🛡️ Client joined role room: role:${role}`);
    });

    // Handle real-time user location updating
    socket.on('update-location', (data) => {
      // Broadcast location to admin dashboard listeners
      socket.to('role:ADMIN').emit('location-updated', {
        userId: data.userId,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocket };
