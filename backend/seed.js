require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Workspace = require('./models/Workspace');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');

  // Clear existing
  await User.deleteMany({});
  await Workspace.deleteMany({});

  // Create test users
  const user1 = new User({
    email: 'alice@example.com',
    password: '123',
    name: 'Alice Johnson'
  });
  await user1.save();

  const user2 = new User({
    email: 'bob@example.com',
    password: '123',
    name: 'Bob Smith'
  });
  await user2.save();

  // Create a default workspace
  const workspace = new Workspace({
    name: 'Vortix Headquarters',
    ownerId: user1._id,
    members: [user1._id],
    inviteCode: 'JOINME'
  });
  await workspace.save();

  // Update Alice's workspaces
  user1.workspaceIds.push(workspace._id);
  await user1.save();

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
