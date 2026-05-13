import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Habit.deleteMany({});
    await HabitLog.deleteMany({});

    // Create a test user
    console.log('Creating test user...');
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      avatar: 'https://i.pravatar.cc/150?img=1',
      morningMotivation: true,
    });
    console.log(`✓ Created user: ${testUser.username}`);

    // Create sample habits
    console.log('Creating sample habits...');
    const habits = await Habit.create([
      {
        userId: testUser._id,
        name: 'Morning Exercise',
        description: 'Workout for 30 minutes',
        category: 'Fitness',
        frequency: 'daily',
        targetDays: 7,
        color: '#ef4444',
        icon: '🏋️',
      },
      {
        userId: testUser._id,
        name: 'Read',
        description: 'Read for at least 20 minutes',
        category: 'Learning',
        frequency: 'daily',
        targetDays: 7,
        color: '#3b82f6',
        icon: '📚',
      },
      {
        userId: testUser._id,
        name: 'Meditation',
        description: 'Meditate for 10 minutes',
        category: 'Mindfulness',
        frequency: 'daily',
        targetDays: 7,
        color: '#8b5cf6',
        icon: '🧘',
      },
      {
        userId: testUser._id,
        name: 'Coding Practice',
        description: 'Practice coding for 1 hour',
        category: 'Learning',
        frequency: 'daily',
        targetDays: 7,
        color: '#10b981',
        icon: '💻',
      },
      {
        userId: testUser._id,
        name: 'Journaling',
        description: 'Write in journal',
        category: 'Productivity',
        frequency: 'daily',
        targetDays: 7,
        color: '#f59e0b',
        icon: '📝',
      },
    ]);
    console.log(`✓ Created ${habits.length} sample habits`);

    // Create sample habit logs for the past week
    console.log('Creating sample habit logs...');
    const logs = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Create logs for 70% of habits each day (random)
      for (const habit of habits) {
        if (Math.random() > 0.3) { // 70% chance
          logs.push({
            userId: testUser._id,
            habitId: habit._id,
            completedDate: dateStr,
            notes: `Completed on ${dateStr}`,
          });
        }
      }
    }

    await HabitLog.create(logs);
    console.log(`✓ Created ${logs.length} habit logs`);

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
