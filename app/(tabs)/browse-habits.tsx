import React, { useState, useMemo } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { Card, Text, Button, Chip, Searchbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { useAllHabitsForBrowsing, useJoinHabit } from "@/lib/queries";
import { Habit } from "@/types/database.type";

type HabitWithJoinStatus = Habit & { canJoin: boolean; isCreatedByUser: boolean; isJoinedByUser: boolean };

export default function BrowseArenasScreen() {
  const { user } = useAuth();
  const { data: allArenas = [], isLoading, error } = useAllHabitsForBrowsing(user?.$id ?? "");
  const joinArena = useJoinHabit();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArenas = useMemo(() => {
    if (!searchQuery.trim()) return allArenas;
    
    const query = searchQuery.toLowerCase();
    return allArenas.filter(arena => 
      arena.title.toLowerCase().includes(query) ||
      arena.description.toLowerCase().includes(query) ||
      arena.frequency.toLowerCase().includes(query) ||
      (arena.unit_label && arena.unit_label.toLowerCase().includes(query)) ||
      (arena.target_value && arena.target_value.toLowerCase().includes(query))
    );
  }, [allArenas, searchQuery]);

  // Debug logging
  React.useEffect(() => {
    console.log("All arenas count:", allArenas.length);
    console.log("Filtered arenas count:", filteredArenas.length);
    if (error) console.log("Error loading arenas:", error);
  }, [allArenas, filteredArenas, error]);

  const handleJoinArena = async (arenaId: string) => {
    if (!user) return;
    
    try {
      await joinArena.mutateAsync({ habitId: arenaId, userId: user.$id });
    } catch (error) {
      console.error("Error joining arena:", error);
    }
  };

  const renderArenaCard = ({ item: arena }: { item: HabitWithJoinStatus }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.arenaTitle}>
            {arena.title}
          </Text>
          <View style={styles.participantBadge}>
            <Text style={styles.participantCount}>
              {arena.participant_count} joined
            </Text>
          </View>
        </View>
        
        <Text variant="bodyMedium" style={styles.arenaDescription}>
          {arena.description}
        </Text>
        
        <View style={styles.arenaMeta}>
          <Chip style={styles.frequencyChip}>
            {arena.frequency}
          </Chip>
          
          {arena.unit_type && arena.unit_type !== 'boolean' && (
            <Chip style={styles.typeChip}>
              {arena.unit_type === 'number' && `Track: ${arena.unit_label || 'numbers'}`}
              {arena.unit_type === 'time' && 'Track: time'}
              {arena.unit_type === 'text' && 'Track: notes'}
            </Chip>
          )}
          
          {arena.target_value && (
            <Chip style={styles.targetChip}>
              Goal: {arena.target_value}
            </Chip>
          )}
        </View>
        
        <View style={styles.creatorInfo}>
          <Text variant="bodySmall" style={styles.creatorText}>
            {arena.isCreatedByUser ? (
              "Created by you"
            ) : (
              `Created by User ${(arena.created_by || (arena as any).user_id || 'Unknown').slice(-4)}`
            )}
          </Text>
        </View>
      </Card.Content>
      
      <Card.Actions>
        {arena.canJoin ? (
          <Button
            mode="contained"
            onPress={() => handleJoinArena(arena.$id)}
            loading={joinArena.isPending}
            disabled={joinArena.isPending}
            style={styles.joinButton}
          >
            Join Arena
          </Button>
        ) : arena.isJoinedByUser ? (
          <Button
            mode="outlined"
            disabled
            style={styles.joinedButton}
          >
            Already Joined
          </Button>
        ) : arena.isCreatedByUser ? (
          <Button
            mode="outlined"
            disabled
            style={styles.ownArenaButton}
          >
            Your Arena
          </Button>
        ) : null}
      </Card.Actions>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading available arenas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Browse Arenas
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Join arenas created by other users
        </Text>
        
        <Searchbar
          placeholder="Search arenas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          icon="magnify"
          clearIcon="close"
        />
      </View>

      {allArenas.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            No arenas found.
          </Text>
          <Text style={styles.emptySubtext}>
            Create your first arena to get started!
          </Text>
        </View>
      ) : filteredArenas.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            No arenas match your search.
          </Text>
          <Text style={styles.emptySubtext}>
            Try different keywords or clear your search.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredArenas}
          renderItem={renderArenaCard}
          keyExtractor={(item, index) => `${item.$id}-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          extraData={filteredArenas.length}
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
  arenaTitle: {
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
  arenaDescription: {
    marginBottom: 12,
    color: "#666",
  },
  arenaMeta: {
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
  ownArenaButton: {
    marginLeft: "auto",
    backgroundColor: "#fff3e0",
  },
});