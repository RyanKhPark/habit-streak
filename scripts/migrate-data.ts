/**
 * Data Migration Script
 * Migrates existing data to the new database schema
 * 
 * Usage: npm run migrate-db
 */

import { Client, Databases, Users, Query, ID } from 'node-appwrite';
import { COLLECTIONS, CONFIG } from './setup-database';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(CONFIG.endpoint)
  .setProject(CONFIG.projectId)
  .setKey(CONFIG.apiKey);

const databases = new Databases(client);
const users = new Users(client);

/**
 * Migrate Appwrite Auth users to Users collection
 */
async function migrateAuthUsers() {
  console.log('👤 Migrating Auth users to Users collection...');
  
  try {
    // Get all auth users
    const authUsers = await users.list();
    console.log(`Found ${authUsers.users.length} auth users`);
    
    for (const authUser of authUsers.users) {
      try {
        // Check if user profile already exists
        const existingProfile = await databases.listDocuments(
          CONFIG.databaseId,
          COLLECTIONS.USERS,
          [Query.equal('auth_user_id', authUser.$id)]
        );
        
        if (existingProfile.documents.length > 0) {
          console.log(`  ⚠️  Profile already exists for: ${authUser.email}`);
          continue;
        }
        
        // Create user profile
        await databases.createDocument(
          CONFIG.databaseId,
          COLLECTIONS.USERS,
          ID.unique(),
          {
            auth_user_id: authUser.$id,
            email: authUser.email,
            name: authUser.name || 'User',
            joined_at: authUser.$createdAt,
            last_active: authUser.$updatedAt || authUser.$createdAt,
            is_verified: authUser.emailVerification,
            subscription_status: 'free',
            is_profile_public: true,
            allow_friend_requests: true,
            total_habits_created: 0,
            total_habits_joined: 0,
            longest_streak: 0,
            current_active_streaks: 0,
          }
        );
        
        console.log(`  ✅ Created profile for: ${authUser.email}`);
        
      } catch (error: any) {
        console.error(`  ❌ Error creating profile for ${authUser.email}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error migrating auth users:', error);
  }
}

/**
 * Migrate existing habits to new schema
 */
async function migrateHabits() {
  console.log('🎯 Migrating existing habits...');
  
  try {
    // Get all existing habits
    const existingHabits = await databases.listDocuments(
      CONFIG.databaseId,
      COLLECTIONS.HABITS,
      [Query.limit(1000)]
    );
    
    console.log(`Found ${existingHabits.documents.length} existing habits`);
    
    for (const habit of existingHabits.documents) {
      try {
        const updates: any = {};
        
        // Migrate user_id to created_by
        if ((habit as any).user_id && !habit.created_by) {
          updates.created_by = (habit as any).user_id;
        }
        
        // Add missing fields with defaults
        if (habit.is_public === undefined) {
          updates.is_public = true;
        }
        
        if (habit.participant_count === undefined) {
          updates.participant_count = 1;
        }
        
        if (habit.total_completions === undefined) {
          updates.total_completions = 0;
        }
        
        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          await databases.updateDocument(
            CONFIG.databaseId,
            COLLECTIONS.HABITS,
            habit.$id,
            updates
          );
          console.log(`  ✅ Updated habit: ${habit.title}`);
        }
        
        // Create participant record for the creator
        if (updates.created_by) {
          try {
            await databases.createDocument(
              CONFIG.databaseId,
              COLLECTIONS.PARTICIPANTS,
              ID.unique(),
              {
                habit_id: habit.$id,
                user_id: updates.created_by,
                joined_at: habit.$createdAt || habit.created_at,
                is_active: true,
                current_streak: habit.streak_count || 0,
                longest_streak: habit.streak_count || 0,
                total_completions: 0, // Will be calculated from completions
              }
            );
            console.log(`    ✅ Created participant record for creator`);
          } catch (error: any) {
            if (!error.message?.includes('already exists')) {
              console.error(`    ❌ Error creating participant:`, error);
            }
          }
        }
        
      } catch (error: any) {
        console.error(`  ❌ Error migrating habit ${habit.title}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error migrating habits:', error);
  }
}

/**
 * Calculate and update participant statistics from completions
 */
async function updateParticipantStats() {
  console.log('📊 Updating participant statistics...');
  
  try {
    // Get all participants
    const participants = await databases.listDocuments(
      CONFIG.databaseId,
      COLLECTIONS.PARTICIPANTS,
      [Query.limit(1000)]
    );
    
    console.log(`Found ${participants.documents.length} participants`);
    
    for (const participant of participants.documents) {
      try {
        // Get completions for this user-habit combination
        const completions = await databases.listDocuments(
          CONFIG.databaseId,
          COLLECTIONS.COMPLETIONS,
          [
            Query.equal('user_id', participant.user_id),
            Query.equal('habit_id', participant.habit_id),
            Query.orderDesc('completed_at'),
            Query.limit(100)
          ]
        );
        
        const totalCompletions = completions.documents.length;
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let lastDate = new Date();
        
        // Calculate streaks
        for (const completion of completions.documents) {
          const completionDate = new Date(completion.completed_at);
          const daysDiff = Math.floor((lastDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff <= 1) {
            tempStreak++;
            if (tempStreak === 1) currentStreak = tempStreak;
          } else {
            if (tempStreak > longestStreak) longestStreak = tempStreak;
            tempStreak = 0;
          }
          
          lastDate = completionDate;
        }
        
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        
        // Update participant record
        await databases.updateDocument(
          CONFIG.databaseId,
          COLLECTIONS.PARTICIPANTS,
          participant.$id,
          {
            total_completions: totalCompletions,
            current_streak: currentStreak,
            longest_streak: Math.max(longestStreak, participant.longest_streak || 0),
            last_completed_at: completions.documents[0]?.completed_at,
          }
        );
        
        console.log(`  ✅ Updated stats for participant (${totalCompletions} completions, ${currentStreak} streak)`);
        
      } catch (error: any) {
        console.error(`  ❌ Error updating participant stats:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating participant statistics:', error);
  }
}

/**
 * Update habit statistics
 */
async function updateHabitStats() {
  console.log('🎯 Updating habit statistics...');
  
  try {
    const habits = await databases.listDocuments(
      CONFIG.databaseId,
      COLLECTIONS.HABITS,
      [Query.limit(1000)]
    );
    
    for (const habit of habits.documents) {
      try {
        // Count active participants
        const activeParticipants = await databases.listDocuments(
          CONFIG.databaseId,
          COLLECTIONS.PARTICIPANTS,
          [
            Query.equal('habit_id', habit.$id),
            Query.equal('is_active', true)
          ]
        );
        
        // Count total completions
        const completions = await databases.listDocuments(
          CONFIG.databaseId,
          COLLECTIONS.COMPLETIONS,
          [Query.equal('habit_id', habit.$id)]
        );
        
        await databases.updateDocument(
          CONFIG.databaseId,
          COLLECTIONS.HABITS,
          habit.$id,
          {
            participant_count: activeParticipants.documents.length,
            total_completions: completions.documents.length,
          }
        );
        
        console.log(`  ✅ Updated stats for: ${habit.title} (${activeParticipants.documents.length} participants)`);
        
      } catch (error: any) {
        console.error(`  ❌ Error updating habit stats for ${habit.title}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating habit statistics:', error);
  }
}

/**
 * Main migration function
 */
async function migrateData() {
  try {
    console.log('🔄 Starting data migration...\n');
    
    await migrateAuthUsers();
    console.log('');
    
    await migrateHabits();
    console.log('');
    
    await updateParticipantStats();
    console.log('');
    
    await updateHabitStats();
    console.log('');
    
    console.log('🎉 Data migration completed successfully!');
    console.log('\n📋 What was migrated:');
    console.log('• Auth users → User profiles');
    console.log('• Habits schema updates');
    console.log('• Participant records created');
    console.log('• Statistics calculated and cached');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateData();
}

export { migrateData };