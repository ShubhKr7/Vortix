const jwt = require('jsonwebtoken');

function setupSocket(io) {
  // Persistent map (for MVP): userId -> { userId, workspaceId, x, y, name }
  const presence = new Map(); 
  // Map for tracking active sockets per user: userId -> Set(socketId)
  const userSockets = new Map();
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
      
      const userId = socket.userId;
      socketToUser.set(socket.id, userId);

      // Add this socket to the user's set of active sockets
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);
      
      // Check if user already has a position in this workspace
      let userData = presence.get(userId);
      
      if (!userData || userData.workspaceId !== workspaceId) {
        // Default position if new or different workspace
        userData = {
          userId,
          name: socket.userName,
          workspaceId,
          x: 400 + Math.random() * 100,
          y: 300 + Math.random() * 100
        };
        presence.set(userId, userData);
      }
      
      // Notify everyone in the workspace about the user (re)joining
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
        
        io.to(socket.workspaceId).emit('user_moved', userData);
      }
    });

    socket.on('disconnect', () => {
      const userId = socketToUser.get(socket.id);
      if (userId) {
        const workspaceId = socket.workspaceId;
        const sockets = userSockets.get(userId);
        
        if (sockets) {
          sockets.delete(socket.id);
          
          // Only remove user from presence if they have no active tabs/sockets left
          if (sockets.size === 0) {
            userSockets.delete(userId);
            presence.delete(userId);
            
            // Notify others that the user is truly gone
            if (workspaceId) {
              io.to(workspaceId).emit('user_left', userId);
            }
          }
        }
        
        socketToUser.delete(socket.id);
      }
    });
  });
}

module.exports = { setupSocket };
