import {
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
  PARTICIPANTS_COLLECTION_ID,
  USERS_COLLECTION_ID,
} from "@/lib/appwrite";
import { Habit, HabitCompletion, HabitParticipant } from "@/types/database.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ID, Query } from "react-native-appwrite";

// Query keys
export const queryKeys = {
  habits: ["habits"] as const,
  completions: ["completions"] as const,
  participants: ["participants"] as const,
  availableHabits: ["availableHabits"] as const,
  userHabits: ["userHabits"] as const,
};

// Fetch habits that the user has joined
export const useUserHabits = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userHabits,
    queryFn: async () => {
      try {
        // Try to get the habits the user has joined from participants table
        const participantResponse = await databases.listDocuments(
          DATABASE_ID,
          PARTICIPANTS_COLLECTION_ID,
          [
            Query.equal("user_id", userId),
            Query.equal("is_active", true)
          ]
        );
        
        const participants = participantResponse.documents as HabitParticipant[];
        
        if (participants.length === 0) {
          return [];
        }
        
        // Get all active participants to calculate participant counts
        const allParticipantsResponse = await databases.listDocuments(
          DATABASE_ID,
          PARTICIPANTS_COLLECTION_ID,
          [
            Query.equal("is_active", true),
            Query.limit(1000)
          ]
        );
        const allParticipants = allParticipantsResponse.documents as HabitParticipant[];
        
        // Get the actual habit details
        const habitIds = participants.map(p => p.habit_id);
        const habitsResponse = await databases.listDocuments(
          DATABASE_ID,
          HABITS_COLLECTION_ID,
          habitIds.length > 0 ? [Query.contains("$id", habitIds)] : []
        );
        
        // Combine habit data with user's participation data and accurate participant counts
        const habits = habitsResponse.documents as Habit[];
        return habits.map(habit => {
          const participation = participants.find(p => p.habit_id === habit.$id);
          const actualParticipantCount = allParticipants.filter(p => p.habit_id === habit.$id).length;
          
          return {
            ...habit,
            participant_count: actualParticipantCount, // Override with actual count
            user_streak_count: participation?.current_streak || 0,
            user_last_completed: participation?.last_completed_at,
          };
        });
      } catch (error) {
        console.log("Participants table not found, falling back to old schema");
        
        // Fallback to habits created by user
        try {
          const response = await databases.listDocuments(
            DATABASE_ID,
            HABITS_COLLECTION_ID,
            [Query.equal("created_by", userId)]
          );
          return response.documents as Habit[];
        } catch (fallbackError) {
          console.error("Error fetching user habits:", fallbackError);
          return [];
        }
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 30,
  });
};

// Fetch all habits for browsing (with join status info)
export const useAllHabitsForBrowsing = (userId: string) => {
  return useQuery({
    queryKey: [...queryKeys.availableHabits, "all"],
    queryFn: async () => {
      try {
        // Get all habits
        let habitsResponse;
        try {
          habitsResponse = await databases.listDocuments(
            DATABASE_ID,
            HABITS_COLLECTION_ID,
            [
              Query.orderDesc("created_at"),
              Query.limit(100)
            ]
          );
        } catch (error) {
          console.error("Error fetching habits:", error);
          return [];
        }

        let joinedHabitIds: string[] = [];
        let allParticipants: HabitParticipant[] = [];
        
        // Get all active participants to calculate participant counts
        try {
          const participantResponse = await databases.listDocuments(
            DATABASE_ID,
            PARTICIPANTS_COLLECTION_ID,
            [
              Query.equal("is_active", true),
              Query.limit(1000)
            ]
          );
          allParticipants = participantResponse.documents as HabitParticipant[];
          joinedHabitIds = allParticipants
            .filter(p => p.user_id === userId)
            .map(p => p.habit_id);
        } catch (error) {
          console.log("Participants collection not found, using user_id for ownership check");
        }
        
        // Return all habits with join status metadata and accurate participant counts
        return habitsResponse.documents.map(habit => {
          const habitUserId = (habit as any).user_id || (habit as any).created_by;
          const isCreatedByUser = habitUserId === userId;
          const isJoinedByUser = joinedHabitIds.includes(habit.$id);
          
          // Calculate actual participant count
          const actualParticipantCount = allParticipants.filter(p => p.habit_id === habit.$id).length;
          
          return {
            ...habit,
            participant_count: actualParticipantCount, // Override with actual count
            canJoin: !isCreatedByUser && !isJoinedByUser,
            isCreatedByUser,
            isJoinedByUser,
          };
        }) as (Habit & { canJoin: boolean; isCreatedByUser: boolean; isJoinedByUser: boolean })[];
      } catch (error) {
        console.error("Error fetching habits for browsing:", error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });
};

// Keep the old function for backward compatibility
export const useAvailableHabits = (userId: string) => useAllHabitsForBrowsing(userId);

// Backward compatibility - use userHabits
export const useHabits = (userId: string) => useUserHabits(userId);

// Fetch today's completions
export const useTodayCompletions = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.completions,
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [
          Query.equal("user_id", userId),
          Query.greaterThanEqual("completed_at", today.toISOString()),
        ]
      );
      return response.documents as HabitCompletion[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
};

// Create habit mutation (now creates public/shared habits)
export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitData: {
      created_by: string;
      title: string;
      description: string;
      frequency: string;
      is_public?: boolean;
      unit_type?: string;
      unit_label?: string;
      target_value?: string;
      requires_input?: boolean;
    }) => {
      // Filter out undefined values to avoid database errors
      const cleanData = Object.fromEntries(
        Object.entries({
          ...habitData,
          is_public: habitData.is_public ?? true, // Default to public
          created_at: new Date().toISOString(),
        }).filter(([_, value]) => value !== undefined)
      );

      // Create the habit
      const habit = await databases.createDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        ID.unique(),
        cleanData
      );

      // Automatically join the creator to the habit
      await databases.createDocument(
        DATABASE_ID,
        PARTICIPANTS_COLLECTION_ID,
        ID.unique(),
        {
          habit_id: habit.$id,
          user_id: habitData.created_by,
          joined_at: new Date().toISOString(),
          current_streak: 0,
          longest_streak: 0,
          total_completions: 0,
          is_active: true,
        }
      );

      return habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits });
      queryClient.invalidateQueries({ queryKey: queryKeys.userHabits });
      queryClient.invalidateQueries({ queryKey: queryKeys.availableHabits });
    },
  });
};

// Join a habit
export const useJoinHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, userId }: { habitId: string; userId: string }) => {
      // Add user as participant
      await databases.createDocument(
        DATABASE_ID,
        PARTICIPANTS_COLLECTION_ID,
        ID.unique(),
        {
          habit_id: habitId,
          user_id: userId,
          joined_at: new Date().toISOString(),
          current_streak: 0,
          longest_streak: 0,
          total_completions: 0,
          is_active: true,
        }
      );
      // No need to manually update participant_count - it's calculated dynamically
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userHabits });
      queryClient.invalidateQueries({ queryKey: queryKeys.availableHabits });
      queryClient.invalidateQueries({ queryKey: queryKeys.habits });
    },
  });
};

// Leave a habit
export const useLeaveHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, userId }: { habitId: string; userId: string }) => {
      // Find and deactivate participation
      const participantResponse = await databases.listDocuments(
        DATABASE_ID,
        PARTICIPANTS_COLLECTION_ID,
        [
          Query.equal("habit_id", habitId),
          Query.equal("user_id", userId),
          Query.equal("is_active", true)
        ]
      );

      if (participantResponse.documents.length > 0) {
        const participant = participantResponse.documents[0];
        await databases.updateDocument(
          DATABASE_ID,
          PARTICIPANTS_COLLECTION_ID,
          participant.$id,
          { is_active: false }
        );
        // No need to manually update participant_count - it's calculated dynamically
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userHabits });
      queryClient.invalidateQueries({ queryKey: queryKeys.availableHabits });
      queryClient.invalidateQueries({ queryKey: queryKeys.habits });
    },
  });
};

// Delete habit mutation
export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: string) => {
      return await databases.deleteDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        habitId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits });
    },
  });
};

// Complete habit mutation
export const useCompleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      habitId,
      userId,
      value,
      displayValue,
    }: {
      habitId: string;
      userId: string;
      value?: string;
      displayValue?: string;
    }) => {
      const currentDate = new Date().toISOString();

      // Create completion record with value
      await databases.createDocument(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        ID.unique(),
        {
          habit_id: habitId,
          user_id: userId,
          completed_at: currentDate,
          value: value || null,
          display_value: displayValue || value || null,
        }
      );

      // Update user's participant streak (not the habit itself)
      const participantResponse = await databases.listDocuments(
        DATABASE_ID,
        PARTICIPANTS_COLLECTION_ID,
        [
          Query.equal("habit_id", habitId),
          Query.equal("user_id", userId),
          Query.equal("is_active", true)
        ]
      );

      if (participantResponse.documents.length > 0) {
        const participant = participantResponse.documents[0];
        await databases.updateDocument(
          DATABASE_ID,
          PARTICIPANTS_COLLECTION_ID,
          participant.$id,
          {
            current_streak: (participant.current_streak || 0) + 1,
            longest_streak: Math.max(participant.longest_streak || 0, (participant.current_streak || 0) + 1),
            total_completions: (participant.total_completions || 0) + 1,
            last_completed_at: currentDate,
          }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits });
      queryClient.invalidateQueries({ queryKey: queryKeys.userHabits });
      queryClient.invalidateQueries({ queryKey: queryKeys.completions });
      queryClient.invalidateQueries({ queryKey: queryKeys.participants });
    },
  });
};

// Create user in database
export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (userData: {
      auth_user_id: string;
      email: string;
      name?: string;
    }) => {
      const userDoc = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          auth_user_id: userData.auth_user_id,
          email: userData.email,
          name: userData.name || userData.email.split('@')[0],
          joined_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
          total_habits_created: 0,
          total_habits_joined: 0,
          longest_streak: 0,
          current_active_streaks: 0,
        }
      );
      return userDoc;
    },
  });
};
