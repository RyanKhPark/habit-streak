import React, { useState, useMemo } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { Card, Text, Button, Chip, Searchbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { useAllHabitsForBrowsing, useJoinHabit } from "@/lib/queries";
import { Habit } from "@/types/database.type";

type HabitWithJoinStatus = Habit & { canJoin: boolean; isCreatedByUser: boolean; isJoinedByUser: boolean };

export default function BrowseHabitsScreen() {
  const { user } = useAuth();
  const { data: allHabits = [], isLoading, error } = useAllHabitsForBrowsing(user?.$id ?? "");
  const joinHabit = useJoinHabit();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHabits = useMemo(() => {
    if (!searchQuery.trim()) return allHabits;
    
    const query = searchQuery.toLowerCase();
    return allHabits.filter(habit => 
      habit.title.toLowerCase().includes(query) ||
      habit.description.toLowerCase().includes(query) ||
      habit.frequency.toLowerCase().includes(query) ||
      (habit.unit_label && habit.unit_label.toLowerCase().includes(query)) ||
      (habit.target_value && habit.target_value.toLowerCase().includes(query))
    );
  }, [allHabits, searchQuery]);

  // Debug logging
  React.useEffect(() => {
    console.log("All habits count:", allHabits.length);
    console.log("Filtered habits count:", filteredHabits.length);
    if (error) console.log("Error loading habits:", error);
  }, [allHabits, filteredHabits, error]);

  const handleJoinHabit = async (habitId: string) => {
    if (!user) return;
    
    try {
      await joinHabit.mutateAsync({ habitId, userId: user.$id });
    } catch (error) {
      console.error("Error joining habit:", error);
    }
  };

  const renderHabitCard = ({ item: habit }: { item: HabitWithJoinStatus }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.habitTitle}>
            {habit.title}
          </Text>
          <View style={styles.participantBadge}>
            <Text style={styles.participantCount}>
              {habit.participant_count} joined
            </Text>
          </View>
        </View>
        
        <Text variant="bodyMedium" style={styles.habitDescription}>
          {habit.description}
        </Text>
        
        <View style={styles.habitMeta}>
          <Chip style={styles.frequencyChip}>
            {habit.frequency}
          </Chip>
          
          {habit.unit_type && habit.unit_type !== 'boolean' && (
            <Chip style={styles.typeChip}>
              {habit.unit_type === 'number' && `Track: ${habit.unit_label || 'numbers'}`}
              {habit.unit_type === 'time' && 'Track: time'}
              {habit.unit_type === 'text' && 'Track: notes'}
            </Chip>
          )}
          
          {habit.target_value && (
            <Chip style={styles.targetChip}>
              Goal: {habit.target_value}
            </Chip>
          )}
        </View>
        
        <View style={styles.creatorInfo}>
          <Text variant="bodySmall" style={styles.creatorText}>
            {habit.isCreatedByUser ? (
              "Created by you"
            ) : (
              `Created by User ${(habit.created_by || (habit as any).user_id || 'Unknown').slice(-4)}`
            )}
          </Text>
        </View>
      </Card.Content>
      
      <Card.Actions>
        {habit.canJoin ? (
          <Button
            mode="contained"
            onPress={() => handleJoinHabit(habit.$id)}
            loading={joinHabit.isPending}
            disabled={joinHabit.isPending}
            style={styles.joinButton}
          >
            Join Habit
          </Button>
        ) : habit.isJoinedByUser ? (
          <Button
            mode="outlined"
            disabled
            style={styles.joinedButton}
          >
            Already Joined
          </Button>
        ) : habit.isCreatedByUser ? (
          <Button
            mode="outlined"
            disabled
            style={styles.ownHabitButton}
          >
            Your Habit
          </Button>
        ) : null}
      </Card.Actions>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading available habits...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Browse Habits
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Join habits created by other users
        </Text>
        
        <Searchbar
          placeholder="Search habits..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          icon="magnify"
          clearIcon="close"
        />
      </View>

      {allHabits.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            No habits found.
          </Text>
          <Text style={styles.emptySubtext}>
            Create your first habit to get started!
          </Text>
        </View>
      ) : filteredHabits.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            No habits match your search.
          </Text>
          <Text style={styles.emptySubtext}>
            Try different keywords or clear your search.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHabits}
          renderItem={renderHabitCard}
          keyExtractor={(item, index) => `${item.$id}-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          extraData={filteredHabits.length}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#666",
    marginBottom: 16,
  },
  searchbar: {
    backgroundColor: "#f5f5f5",
    elevation: 0,
  },
  searchInput: {
    color: "#333",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    color: "#666",
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  habitTitle: {
    fontWeight: "bold",
    flex: 1,
  },
  participantBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantCount: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "500",
  },
  habitDescription: {
    marginBottom: 12,
    color: "#666",
  },
  habitMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  frequencyChip: {
    backgroundColor: "#f3e5f5",
  },
  typeChip: {
    backgroundColor: "#e8f5e9",
  },
  targetChip: {
    backgroundColor: "#fff3e0",
  },
  creatorInfo: {
    marginBottom: 8,
  },
  creatorText: {
    color: "#999",
    fontStyle: "italic",
  },
  joinButton: {
    marginLeft: "auto",
  },
  joinedButton: {
    marginLeft: "auto",
    backgroundColor: "#e8f5e9",
  },
  ownHabitButton: {
    marginLeft: "auto",
    backgroundColor: "#fff3e0",
  },
});