const jwt = require('jsonwebtoken');

function setupSocket(io) {
  // Persistent map (for MVP): userId -> { userId, workspaceId, x, y, name }
  const presence = new Map(); 
  // Temporary map for cleanup: socketId -> userId
  const socketToUser = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.userId = decoded.userId;
      socket.userName = decoded.name;
      next();
    });
  });

  io.on('connection', (socket) => {
    socket.on('join_workspace', (workspaceId) => {
      socket.join(workspaceId);
      socket.workspaceId = workspaceId;
      socketToUser.set(socket.id, socket.userId);
      
      // Check if user already has a position in this workspace
      let userData = presence.get(socket.userId);
      
      if (!userData || userData.workspaceId !== workspaceId) {
        // Default position if new or different workspace
        userData = {
          userId: socket.userId,
          name: socket.userName,
          workspaceId,
          x: 400 + Math.random() * 100, // Spawn closer to center
          y: 300 + Math.random() * 100
        };
        presence.set(socket.userId, userData);
      }
      
      // Notify EVERYONE in the workspace (including joining user)
      // socket.to is for others, io.to is for all
      io.to(workspaceId).emit('user_joined', userData);
      
      // Send current users in the workspace to the joining user
      const workspaceUsers = Array.from(presence.values())
        .filter(u => u.workspaceId === workspaceId);
      socket.emit('users_update', workspaceUsers);
    });

    socket.on('move', (position) => {
      const userData = presence.get(socket.userId);
      if (userData && userData.workspaceId === socket.workspaceId) {
        userData.x = position.x;
        userData.y = position.y;
        presence.set(socket.userId, userData);
        
        // Broadcast to all
        io.to(socket.workspaceId).emit('user_moved', userData);
      }
    });

    socket.on('disconnect', () => {
      const userId = socketToUser.get(socket.id);
      if (userId) {
        // We keep the presence in the map but notify others of "offline" status if needed
        // For MVP, we just notify of "left" for visual removal if desired
        // but keep the (x,y) in the Map for reload
        socket.to(socket.workspaceId).emit('user_left', userId);
        socketToUser.delete(socket.id);
      }
    });
  });
}

module.exports = { setupSocket };
