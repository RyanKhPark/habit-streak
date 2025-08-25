import { Models } from "react-native-appwrite";

export type UnitType = "number" | "time" | "boolean" | "text";

export interface Habit extends Models.Document {
  created_by: string; // User who created the habit
  title: string;
  description: string;
  frequency: string;
  created_at: string;
  is_public: boolean; // Whether other users can join
  participant_count: number; // How many users have joined
  // Enhanced unit system - optional for backward compatibility
  unit_type?: UnitType; // "number", "time", "boolean", "text"
  unit_label?: string; // "km", "minutes", "pages", "hours", etc.
  target_value?: string; // Flexible target (could be "30 minutes", "5 km", "yes", etc.)
  requires_input?: boolean; // Whether completion needs user input
}

// New table for tracking user participation in habits
export interface HabitParticipant extends Models.Document {
  habit_id: string;
  user_id: string;
  joined_at: string;
  current_streak: number; // Individual current streak for this user
  longest_streak: number; // Individual longest streak for this user
  total_completions: number; // Total completions by this user
  last_completed_at?: string; // When this user last completed the habit
  is_active: boolean; // Whether user is still participating
  reminder_time?: string; // Optional reminder time
  personal_target?: string; // Personal target for this habit
  notes?: string; // Personal notes
}

export interface HabitCompletion extends Models.Document {
  habit_id: string;
  user_id: string;
  completed_at: string;
  // Flexible value storage
  value?: string; // Store as string to handle all types: "5.2", "00:30:00", "true", "chapter 5"
  display_value?: string; // Formatted display value: "5.2 km", "30 minutes", "Yes", "Chapter 5"
}

export interface UserRecord {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  completions: HabitCompletion[];
  totalCount: number;
  averageValue?: number;
  lastCompletion?: HabitCompletion;
  rank: number;
}
