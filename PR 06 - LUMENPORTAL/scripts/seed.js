require('dotenv').config();

const mongoose = require('mongoose');
const connectDatabase = require('../config/db');
const Account = require('../src/models/Account');
const Topic = require('../src/models/Topic');

const seed = async () => {
  await connectDatabase();

  const adminEmail = 'admin@lumenportal.dev';
  const Publication = require('../src/models/Publication');

  let admin = await Account.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await Account.hashPassword('Admin@12345');
    admin = await Account.create({
      fullName: 'Portal Administrator',
      email: adminEmail,
      passwordHash,
      role: 'administrator'
    });
    console.log('Administrator account created');
  }

  let topics = await Topic.find();
  if (topics.length === 0) {
    topics = await Topic.insertMany([
      {
        title: 'Research Spotlight',
        description: 'Breakthrough findings from campus labs',
        accentColor: '#10b981',
        createdBy: admin._id
      },
      {
        title: 'Campus Life',
        description: 'Events, clubs, and student experiences',
        accentColor: '#8fa28a',
        createdBy: admin._id
      },
      {
        title: 'Industry Connect',
        description: 'Placements, internships, and alumni stories',
        accentColor: '#c8a96b',
        createdBy: admin._id
      }
    ]);
    console.log('Sample topics created');
  }

  const pubCount = await Publication.countDocuments();
  if (pubCount === 0) {
    const topicResearch = topics.find(t => t.title === 'Research Spotlight') || topics[0];
    const topicCampus = topics.find(t => t.title === 'Campus Life') || topics[0];
    const topicIndustry = topics.find(t => t.title === 'Industry Connect') || topics[0];

    await Publication.create([
      {
        headline: 'AI & Quantum Computing Advances in 2026',
        summary: 'Explore breakthrough research in machine learning and quantum algorithms from our campus computer science lab.',
        body: '<p>Our research team has published landmark findings on hybrid quantum-classical algorithms targeting real-time web intelligence.</p>',
        status: 'published',
        topic: topicResearch._id,
        author: admin._id,
        viewCount: 142,
        readingMinutes: 5,
        publishedAt: new Date(Date.now() - 3 * 86400000)
      },
      {
        headline: 'Annual Hackathon & Cultural Fest 2026 Event Guide',
        summary: 'Get ready for 48 hours of non-stop coding, robotics showcases, and music performances at our annual festival.',
        body: '<p>The annual hackathon returns with over 500 participants, 12 tracks, and generous sponsor awards.</p>',
        status: 'published',
        topic: topicCampus._id,
        author: admin._id,
        viewCount: 210,
        readingMinutes: 4,
        publishedAt: new Date(Date.now() - 5 * 86400000)
      },
      {
        headline: 'Top High-Growth MERN Stack & Cloud Career Paths',
        summary: 'Key insights from placement officers and industry experts on securing lead software engineer roles.',
        body: '<p>Full-stack MERN development combined with Node.js microservices remains one of the highest-demand skills.</p>',
        status: 'published',
        topic: topicIndustry._id,
        author: admin._id,
        viewCount: 380,
        readingMinutes: 6,
        publishedAt: new Date(Date.now() - 1 * 86400000)
      },
      {
        headline: 'Upcoming Next.js & Node.js Microservices Workshop',
        summary: 'Draft syllabus for the upcoming weekend hands-on boot camp covering web architecture.',
        body: '<p>Drafting workshop curriculum on API gateways and event-driven Node.js design patterns.</p>',
        status: 'draft',
        topic: topicResearch._id,
        author: admin._id,
        viewCount: 0,
        readingMinutes: 3
      },
      {
        headline: 'Alumni Spotlight: Building Scalable Web Apps',
        summary: 'Interview with senior alumni on scaling Node.js applications to millions of concurrent active users.',
        body: '<p>In this exclusive interview, our distinguished alumnus shares practical tips on database indexing and caching.</p>',
        status: 'published',
        topic: topicIndustry._id,
        author: admin._id,
        viewCount: 95,
        readingMinutes: 5,
        publishedAt: new Date(Date.now() - 2 * 86400000)
      }
    ]);
    console.log('Sample publications created!');
  }

  await mongoose.connection.close();
  console.log('Seed completed');
};

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
