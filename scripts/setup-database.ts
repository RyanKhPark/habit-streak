/**
 * Appwrite Database Setup Script
 * Run this script to create/update your database schema programmatically
 * 
 * Usage: npx tsx scripts/setup-database.ts
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configuration
const CONFIG = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  apiKey: process.env.APPWRITE_API_KEY!, // Server API key (add this to .env.local)
  databaseId: process.env.EXPO_PUBLIC_DB_ID || 'habit-tracker-db',
};

// Collection IDs
const COLLECTIONS = {
  USERS: 'users',
  HABITS: 'habits', 
  PARTICIPANTS: 'participants',
  COMPLETIONS: 'completions',
} as const;

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(CONFIG.endpoint)
  .setProject(CONFIG.projectId)
  .setKey(CONFIG.apiKey);

const databases = new Databases(client);

/**
 * Create Database if it doesn't exist
 */
async function createDatabase() {
  try {
    console.log('📦 Creating/updating database...');
    
    try {
      const db = await databases.get(CONFIG.databaseId);
      console.log('✅ Database exists:', db.name);
    } catch (error) {
      // Database doesn't exist, create it
      await databases.create(
        CONFIG.databaseId,
        'Habit Tracker Database',
      );
      console.log('✅ Database created successfully');
    }
  } catch (error) {
    console.error('❌ Error with database:', error);
    throw error;
  }
}

/**
 * Create Users Collection
 */
async function createUsersCollection() {
  console.log('👥 Creating Users collection...');
  
  try {
    // Try to get existing collection
    await databases.getCollection(CONFIG.databaseId, COLLECTIONS.USERS);
    console.log('✅ Users collection already exists');
  } catch (error) {
    // Create collection
    await databases.createCollection(
      CONFIG.databaseId,
      COLLECTIONS.USERS,
      'Users',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false, // documentSecurity
      true   // enabled
    );
    console.log('✅ Users collection created');
  }

  // Create attributes
  const userAttributes = [
    { key: 'auth_user_id', type: 'string', size: 50, required: true },
    { key: 'email', type: 'string', size: 255, required: true },
    { key: 'name', type: 'string', size: 100, required: true },
    { key: 'avatar_url', type: 'string', size: 500, required: false },
    { key: 'bio', type: 'string', size: 1000, required: false },
    { key: 'location', type: 'string', size: 100, required: false },
    { key: 'subscription_status', type: 'string', size: 20, required: false, default: 'free' },
    { key: 'subscription_ends_at', type: 'string', size: 50, required: false },
    { key: 'joined_at', type: 'string', size: 50, required: true },
    { key: 'last_active', type: 'string', size: 50, required: true },
    { key: 'is_verified', type: 'boolean', required: false, default: false },
    { key: 'is_profile_public', type: 'boolean', required: false, default: true },
    { key: 'allow_friend_requests', type: 'boolean', required: false, default: true },
    { key: 'total_habits_created', type: 'integer', required: false, default: 0 },
    { key: 'total_habits_joined', type: 'integer', required: false, default: 0 },
    { key: 'longest_streak', type: 'integer', required: false, default: 0 },
    { key: 'current_active_streaks', type: 'integer', required: false, default: 0 },
  ];

  await createAttributes(CONFIG.databaseId, COLLECTIONS.USERS, userAttributes);

  // Create indexes
  const userIndexes = [
    { key: 'idx_users_email', attributes: ['email'], type: 'unique' },
    { key: 'idx_users_auth_id', attributes: ['auth_user_id'], type: 'unique' },
    { key: 'idx_users_subscription', attributes: ['subscription_status'], type: 'key' },
  ];

  await createIndexes(CONFIG.databaseId, COLLECTIONS.USERS, userIndexes);
}

/**
 * Create Habits Collection
 */
async function createHabitsCollection() {
  console.log('🎯 Creating Habits collection...');
  
  try {
    await databases.getCollection(CONFIG.databaseId, COLLECTIONS.HABITS);
    console.log('✅ Habits collection already exists');
  } catch (error) {
    await databases.createCollection(
      CONFIG.databaseId,
      COLLECTIONS.HABITS,
      'Habits',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log('✅ Habits collection created');
  }

  const habitAttributes = [
    { key: 'created_by', type: 'string', size: 50, required: true },
    { key: 'title', type: 'string', size: 200, required: true },
    { key: 'description', type: 'string', size: 1000, required: true },
    { key: 'frequency', type: 'string', size: 50, required: true },
    { key: 'created_at', type: 'string', size: 50, required: true },
    { key: 'is_public', type: 'boolean', required: false, default: true },
    { key: 'participant_count', type: 'integer', required: false, default: 1 },
    { key: 'total_completions', type: 'integer', required: false, default: 0 },
    { key: 'average_completion_rate', type: 'float', required: false },
    { key: 'unit_type', type: 'string', size: 20, required: false },
    { key: 'unit_label', type: 'string', size: 50, required: false },
    { key: 'target_value', type: 'string', size: 100, required: false },
    { key: 'requires_input', type: 'boolean', required: false, default: false },
  ];

  await createAttributes(CONFIG.databaseId, COLLECTIONS.HABITS, habitAttributes);

  const habitIndexes = [
    { key: 'idx_habits_public_created', attributes: ['is_public', 'created_at'], type: 'key' },
    { key: 'idx_habits_creator', attributes: ['created_by'], type: 'key' },
    { key: 'idx_habits_frequency', attributes: ['frequency'], type: 'key' },
  ];

  await createIndexes(CONFIG.databaseId, COLLECTIONS.HABITS, habitIndexes);
}

/**
 * Create Participants Collection
 */
async function createParticipantsCollection() {
  console.log('🤝 Creating Participants collection...');
  
  try {
    await databases.getCollection(CONFIG.databaseId, COLLECTIONS.PARTICIPANTS);
    console.log('✅ Participants collection already exists');
  } catch (error) {
    await databases.createCollection(
      CONFIG.databaseId,
      COLLECTIONS.PARTICIPANTS,
      'Habit Participants',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log('✅ Participants collection created');
  }

  const participantAttributes = [
    { key: 'habit_id', type: 'string', size: 50, required: true },
    { key: 'user_id', type: 'string', size: 50, required: true },
    { key: 'joined_at', type: 'string', size: 50, required: true },
    { key: 'is_active', type: 'boolean', required: false, default: true },
    { key: 'current_streak', type: 'integer', required: false, default: 0 },
    { key: 'longest_streak', type: 'integer', required: false, default: 0 },
    { key: 'total_completions', type: 'integer', required: false, default: 0 },
    { key: 'last_completed_at', type: 'string', size: 50, required: false },
    { key: 'reminder_time', type: 'string', size: 20, required: false },
    { key: 'personal_target', type: 'string', size: 100, required: false },
    { key: 'notes', type: 'string', size: 1000, required: false },
  ];

  await createAttributes(CONFIG.databaseId, COLLECTIONS.PARTICIPANTS, participantAttributes);

  const participantIndexes = [
    { key: 'idx_participants_user_active', attributes: ['user_id', 'is_active'], type: 'key' },
    { key: 'idx_participants_habit_active', attributes: ['habit_id', 'is_active'], type: 'key' },
    { key: 'idx_participants_user_habit', attributes: ['user_id', 'habit_id'], type: 'unique' },
    { key: 'idx_participants_joined', attributes: ['joined_at'], type: 'key' },
  ];

  await createIndexes(CONFIG.databaseId, COLLECTIONS.PARTICIPANTS, participantIndexes);
}

/**
 * Create Completions Collection
 */
async function createCompletionsCollection() {
  console.log('✅ Creating Completions collection...');
  
  try {
    await databases.getCollection(CONFIG.databaseId, COLLECTIONS.COMPLETIONS);
    console.log('✅ Completions collection already exists');
  } catch (error) {
    await databases.createCollection(
      CONFIG.databaseId,
      COLLECTIONS.COMPLETIONS,
      'Habit Completions',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log('✅ Completions collection created');
  }

  const completionAttributes = [
    { key: 'habit_id', type: 'string', size: 50, required: true },
    { key: 'user_id', type: 'string', size: 50, required: true },
    { key: 'completed_at', type: 'string', size: 50, required: true },
    { key: 'value', type: 'string', size: 200, required: false },
    { key: 'display_value', type: 'string', size: 200, required: false },
    { key: 'completion_method', type: 'string', size: 20, required: false, default: 'manual' },
    { key: 'location', type: 'string', size: 200, required: false },
    { key: 'mood_rating', type: 'integer', required: false },
    { key: 'notes', type: 'string', size: 500, required: false },
  ];

  await createAttributes(CONFIG.databaseId, COLLECTIONS.COMPLETIONS, completionAttributes);

  const completionIndexes = [
    { key: 'idx_completions_user_habit_date', attributes: ['user_id', 'habit_id', 'completed_at'], type: 'key' },
    { key: 'idx_completions_habit_date', attributes: ['habit_id', 'completed_at'], type: 'key' },
    { key: 'idx_completions_user_date', attributes: ['user_id', 'completed_at'], type: 'key' },
    { key: 'idx_completions_method', attributes: ['completion_method'], type: 'key' },
  ];

  await createIndexes(CONFIG.databaseId, COLLECTIONS.COMPLETIONS, completionIndexes);
}

/**
 * Helper function to create attributes
 */
async function createAttributes(databaseId: string, collectionId: string, attributes: any[]) {
  for (const attr of attributes) {
    try {
      console.log(`  🔧 Creating attribute: ${attr.key}`);
      
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.size,
          attr.required,
          attr.default,
          false // array
        );
      } else if (attr.type === 'boolean') {
        await databases.createBooleanAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.required,
          attr.default,
          false // array
        );
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.required,
          undefined, // min
          undefined, // max
          attr.default,
          false // array
        );
      } else if (attr.type === 'float') {
        await databases.createFloatAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.required,
          undefined, // min
          undefined, // max
          attr.default,
          false // array
        );
      }
      
      // Wait a bit between attribute creation
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log(`  ⚠️  Attribute ${attr.key} already exists`);
      } else {
        console.error(`  ❌ Error creating attribute ${attr.key}:`, error);
        throw error;
      }
    }
  }
}

/**
 * Helper function to create indexes
 */
async function createIndexes(databaseId: string, collectionId: string, indexes: any[]) {
  for (const index of indexes) {
    try {
      console.log(`  📊 Creating index: ${index.key}`);
      
      await databases.createIndex(
        databaseId,
        collectionId,
        index.key,
        index.type,
        index.attributes
      );
      
      // Wait between index creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log(`  ⚠️  Index ${index.key} already exists`);
      } else {
        console.error(`  ❌ Error creating index ${index.key}:`, error);
      }
    }
  }
}

/**
 * Main setup function
 */
async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');
    
    // Validate configuration
    if (!CONFIG.endpoint || !CONFIG.projectId || !CONFIG.apiKey) {
      throw new Error('Missing required environment variables. Please check your .env.local file.');
    }
    
    await createDatabase();
    await createUsersCollection();
    await createHabitsCollection();
    await createParticipantsCollection();
    await createCompletionsCollection();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env.local with the collection IDs');
    console.log('2. Run your app to test the new database structure');
    console.log('3. Consider running data migration if you have existing data');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase, COLLECTIONS, CONFIG };