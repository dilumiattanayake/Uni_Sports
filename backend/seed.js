require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');

// Import models
const User = require('./models/User');
const Sport = require('./models/Sport');
const Location = require('./models/Location');
const PracticeSession = require('./models/PracticeSession');

/**
 * Seed Script
 * Populates the database with initial data for testing
 * 
 * Usage: node seed.js
 */

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    
    // Clear existing data
    await User.deleteMany({});
    await Sport.deleteMany({});
    await Location.deleteMany({});
    await PracticeSession.deleteMany({});

    console.log('✅ Data cleared successfully\n');

    // Create Admin
    console.log('👤 Creating users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@unisports.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create Coaches
    const coach1 = await User.create({
      name: 'Coach John Smith',
      email: 'coach1@unisports.com',
      password: 'coach123',
      role: 'coach',
      specialization: 'Basketball & Athletics',
      phone: '+1234567890',
    });

    const coach2 = await User.create({
      name: 'Coach Sarah Johnson',
      email: 'coach2@unisports.com',
      password: 'coach123',
      role: 'coach',
      specialization: 'Swimming & Fitness',
      phone: '+1234567891',
    });

    // Create Students
    const student1 = await User.create({
      name: 'Student Alice Brown',
      email: 'student1@unisports.com',
      password: 'student123',
      role: 'student',
      studentId: 'ST2024001',
      phone: '+1234567892',
    });

    const student2 = await User.create({
      name: 'Student Bob Wilson',
      email: 'student2@unisports.com',
      password: 'student123',
      role: 'student',
      studentId: 'ST2024002',
      phone: '+1234567893',
    });

    console.log('✅ Users created successfully\n');

    // Create Sports
    console.log('🏀 Creating sports...');
    const basketball = await Sport.create({
      name: 'Basketball',
      description: 'Fast-paced team sport played on a court with hoops',
      category: 'team',
      coaches: [coach1._id],
      equipmentNeeded: ['Basketball', 'Court', 'Hoops', 'Jerseys'],
      maxParticipants: 20,
      imageUrl: 'https://example.com/basketball.jpg',
    });

    const swimming = await Sport.create({
      name: 'Swimming',
      description: 'Aquatic sport for fitness and competition',
      category: 'water',
      coaches: [coach2._id],
      equipmentNeeded: ['Pool', 'Swimsuit', 'Goggles', 'Swim cap'],
      maxParticipants: 15,
      imageUrl: 'https://example.com/swimming.jpg',
    });

    const athletics = await Sport.create({
      name: 'Athletics',
      description: 'Track and field events including running, jumping, and throwing',
      category: 'outdoor',
      coaches: [coach1._id],
      equipmentNeeded: ['Track', 'Running shoes', 'Stopwatch'],
      maxParticipants: 25,
      imageUrl: 'https://example.com/athletics.jpg',
    });

    const tennis = await Sport.create({
      name: 'Tennis',
      description: 'Racket sport played individually or in doubles',
      category: 'outdoor',
      coaches: [],
      equipmentNeeded: ['Tennis court', 'Rackets', 'Tennis balls', 'Net'],
      maxParticipants: 12,
      imageUrl: 'https://example.com/tennis.jpg',
    });

    // Update coaches with assigned sports
    await User.findByIdAndUpdate(coach1._id, {
      assignedSports: [basketball._id, athletics._id],
    });

    await User.findByIdAndUpdate(coach2._id, {
      assignedSports: [swimming._id],
    });

    console.log('✅ Sports created successfully\n');

    // Create Locations
    console.log('📍 Creating locations...');
    const basketballCourt = await Location.create({
      name: 'Main Basketball Court',
      type: 'court',
      capacity: 40,
      address: 'Sports Complex, Building A',
      facilities: ['Changing rooms', 'Equipment storage', 'First aid', 'Seating'],
      operatingHours: {
        open: '06:00',
        close: '22:00',
      },
    });

    const swimmingPool = await Location.create({
      name: 'University Swimming Pool',
      type: 'pool',
      capacity: 30,
      address: 'Aquatic Center, Building B',
      facilities: ['Changing rooms', 'Showers', 'Lockers', 'First aid'],
      operatingHours: {
        open: '06:00',
        close: '21:00',
      },
    });

    const athleticsTrack = await Location.create({
      name: 'Outdoor Athletics Track',
      type: 'track',
      capacity: 50,
      address: 'Main Sports Field',
      facilities: ['Bleachers', 'Equipment shed', 'Water fountains'],
      operatingHours: {
        open: '06:00',
        close: '20:00',
      },
    });

    const tennisCourt = await Location.create({
      name: 'Tennis Courts',
      type: 'court',
      capacity: 16,
      address: 'Tennis Complex, East Side',
      facilities: ['Equipment rental', 'Water fountains', 'Seating'],
      operatingHours: {
        open: '07:00',
        close: '19:00',
      },
    });

    console.log('✅ Locations created successfully\n');

    // Create Practice Sessions
    console.log('📅 Creating practice sessions...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(12, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);

    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setHours(16, 0, 0, 0);

    const session1 = await PracticeSession.create({
      sport: basketball._id,
      coach: coach1._id,
      location: basketballCourt._id,
      startTime: tomorrow,
      endTime: tomorrowEnd,
      title: 'Basketball Fundamentals Training',
      description: 'Learn basic basketball skills and techniques',
      maxParticipants: 15,
      status: 'scheduled',
    });

    const session2 = await PracticeSession.create({
      sport: swimming._id,
      coach: coach2._id,
      location: swimmingPool._id,
      startTime: tomorrow,
      endTime: tomorrowEnd,
      title: 'Swimming Technique Workshop',
      description: 'Improve your swimming strokes and endurance',
      maxParticipants: 12,
      status: 'scheduled',
    });

    const session3 = await PracticeSession.create({
      sport: athletics._id,
      coach: coach1._id,
      location: athleticsTrack._id,
      startTime: nextWeek,
      endTime: nextWeekEnd,
      title: 'Sprint Training Session',
      description: 'Focus on speed and agility',
      maxParticipants: 20,
      status: 'scheduled',
    });

    console.log('✅ Practice sessions created successfully\n');

    console.log('═══════════════════════════════════════');
    console.log('✅ Database seeded successfully!');
    console.log('═══════════════════════════════════════\n');

    console.log('📝 Login Credentials:\n');
    console.log('Admin:');
    console.log('  Email: admin@unisports.com');
    console.log('  Password: admin123\n');
    console.log('Coach 1:');
    console.log('  Email: coach1@unisports.com');
    console.log('  Password: coach123\n');
    console.log('Coach 2:');
    console.log('  Email: coach2@unisports.com');
    console.log('  Password: coach123\n');
    console.log('Student 1:');
    console.log('  Email: student1@unisports.com');
    console.log('  Password: student123\n');
    console.log('Student 2:');
    console.log('  Email: student2@unisports.com');
    console.log('  Password: student123\n');

    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedData();
