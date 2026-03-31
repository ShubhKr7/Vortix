const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  inviteCode: {
    type: String,
    required: true,
    unique: true,
  },
  layout: {
    type: Object, // JSON for room zones
    default: {
      rooms: [
        { id: 'main-meeting', name: 'Boardroom', x: 550, y: 50, width: 420, height: 450, type: 'meeting' },
        { id: 'kitchen', name: 'Kitchenette', x: 550, y: 530, width: 420, height: 270, type: 'private' },
        { id: 'small-huddle', name: 'Huddle Room', x: 450, y: 50, width: 80, height: 120, type: 'meeting' }
      ],
      walls: [
        // Meeting Room Walls
        { x: 540, y: 50, width: 10, height: 450 }, // Left wall of boardroom
        { x: 540, y: 500, width: 450, height: 10 }, // Top wall of kitchen
        { x: 540, y: 50, width: 450, height: 10 }, // Top wall of boardroom
        
        // Desk Obstacles (Optional: make them solid)
        { x: 335, y: 220, width: 155, height: 140 }, // Top desk set
        { x: 400, y: 440, width: 75, height: 155 },  // Middle desk
        { x: 335, y: 690, width: 155, height: 140 }  // Bottom desk set
      ]
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);
