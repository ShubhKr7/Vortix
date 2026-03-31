const express = require('express');
const { AccessToken } = require('livekit-server-sdk');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.userId = decoded.userId;
    req.userName = decoded.name;
    next();
  });
};

router.post('/create', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const workspace = new Workspace({
      name,
      ownerId: req.userId,
      members: [req.userId],
      inviteCode
    });
    await workspace.save();
    
    // Add to user's workspaces
    await User.findByIdAndUpdate(req.userId, { $push: { workspaceIds: workspace._id } });
    
    res.status(201).json(workspace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/join', authenticate, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const workspace = await Workspace.findOne({ inviteCode });
    if (!workspace) throw new Error('Invalid invite code');
    
    if (!workspace.members.includes(req.userId)) {
      workspace.members.push(req.userId);
      await workspace.save();
      await User.findByIdAndUpdate(req.userId, { $push: { workspaceIds: workspace._id } });
    }
    
    res.json(workspace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('workspaceIds');
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json(user.workspaceIds);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id).populate('members', 'name email');
        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
        
        if (!workspace.members.map(m => m._id.toString()).includes(req.userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(workspace);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// LiveKit Token Route
router.get('/:id/token', authenticate, async (req, res) => {
  try {
    const { id: workspaceId } = req.params;
    
    // Verify member
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    
    if (!workspace.members.includes(req.userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: req.userId,
        name: req.userName,
      }
    );

    at.addGrant({
      roomJoin: true,
      room: workspaceId,
      canPublish: true,
      canSubscribe: true,
    });

    res.json({ token: await at.toJwt() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
