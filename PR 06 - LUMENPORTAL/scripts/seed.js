require('dotenv').config();

const mongoose = require('mongoose');
const connectDatabase = require('../config/db');
const Account = require('../src/models/Account');
const Topic = require('../src/models/Topic');

const seed = async () => {
  await connectDatabase();

  const adminEmail = 'admin@lumenportal.dev';
  const existingAdmin = await Account.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const passwordHash = await Account.hashPassword('Admin@12345');
    await Account.create({
      fullName: 'Portal Administrator',
      email: adminEmail,
      passwordHash,
      role: 'administrator'
    });
    console.log('Administrator account created');
    console.log('Email: admin@lumenportal.dev');
    console.log('Password: Admin@12345');
  } else {
    console.log('Administrator account already exists');
  }

  const topicCount = await Topic.countDocuments();
  if (topicCount === 0) {
    const admin = await Account.findOne({ email: adminEmail });
    await Topic.insertMany([
      {
        title: 'Research Spotlight',
        description: 'Breakthrough findings from campus labs',
        accentColor: '#6366f1',
        createdBy: admin._id
      },
      {
        title: 'Campus Life',
        description: 'Events, clubs, and student experiences',
        accentColor: '#8b5cf6',
        createdBy: admin._id
      },
      {
        title: 'Industry Connect',
        description: 'Placements, internships, and alumni stories',
        accentColor: '#06b6d4',
        createdBy: admin._id
      }
    ]);
    console.log('Sample topics created');
  }

  await mongoose.connection.close();
  console.log('Seed completed');
};

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
