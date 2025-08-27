import { useAuth } from "@/lib/auth-context";
import { useAllHabitsForBrowsing, useJoinHabit } from "@/lib/queries";
import { Habit } from "@/types/database.type";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Card, Chip, Searchbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../components/AppHeader";
import { GradientBackground } from "../components/GradientBackground";
import { useTimeBasedTheme } from "../hooks/useTimeBasedTheme";

type HabitWithJoinStatus = Habit & {
  canJoin: boolean;
  isCreatedByUser: boolean;
  isJoinedByUser: boolean;
};

export default function BrowseArenasScreen() {
  const { user } = useAuth();
  const theme = useTimeBasedTheme();
  const {
    data: allArenas = [],
    isLoading,
    error,
  } = useAllHabitsForBrowsing(user?.$id ?? "");
  const joinArena = useJoinHabit();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArenas = useMemo(() => {
    if (!searchQuery.trim()) return allArenas;

    const query = searchQuery.toLowerCase();
    return allArenas.filter(
      (arena) =>
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
    <Card style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={[styles.arenaTitle, { color: theme.primaryText }]}>
            {arena.title}
          </Text>
          <View style={[styles.participantBadge, { backgroundColor: theme.accentColor }]}>
            <Text style={[styles.participantCount, { color: theme.primaryButtonText }]}>
              {arena.participant_count} joined
            </Text>
          </View>
        </View>

        <Text variant="bodyMedium" style={[styles.arenaDescription, { color: theme.secondaryText }]}>
          {arena.description}
        </Text>

        <View style={styles.arenaMeta}>
          <Chip style={[styles.frequencyChip, { backgroundColor: theme.surfaceBackground }]} textStyle={{ color: theme.primaryText }}>{arena.frequency}</Chip>

          {arena.unit_type && arena.unit_type !== "boolean" && (
            <Chip style={[styles.typeChip, { backgroundColor: theme.successColor }]} textStyle={{ color: theme.primaryButtonText }}>
              {arena.unit_type === "number" &&
                `Track: ${arena.unit_label || "numbers"}`}
              {arena.unit_type === "time" && "Track: time"}
              {arena.unit_type === "text" && "Track: notes"}
            </Chip>
          )}

          {arena.target_value && (
            <Chip style={[styles.targetChip, { backgroundColor: theme.warningColor }]} textStyle={{ color: theme.primaryButtonText }}>Goal: {arena.target_value}</Chip>
          )}
        </View>

        <View style={styles.creatorInfo}>
          <Text variant="bodySmall" style={[styles.creatorText, { color: theme.secondaryText }]}>
            {arena.isCreatedByUser
              ? "Created by you"
              : `Created by User ${(
                  arena.created_by ||
                  (arena as any).user_id ||
                  "Unknown"
                ).slice(-4)}`}
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
            buttonColor={theme.primaryButton}
            textColor={theme.primaryButtonText}
          >
            Join Arena
          </Button>
        ) : arena.isJoinedByUser ? (
          <Button 
            mode="outlined" 
            disabled 
            style={styles.joinedButton}
            buttonColor={theme.successColor}
            textColor={theme.primaryButtonText}
          >
            Already Joined
          </Button>
        ) : arena.isCreatedByUser ? (
          <Button 
            mode="outlined" 
            disabled 
            style={styles.ownArenaButton}
            buttonColor={theme.warningColor}
            textColor={theme.primaryButtonText}
          >
            Your Arena
          </Button>
        ) : null}
      </Card.Actions>
    </Card>
  );

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={styles.centerContainer}>
          <Text style={{ color: theme.primaryText }}>Loading available arenas...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <AppHeader title="Browse Arenas" />
        <View style={styles.content}>
          <View style={styles.searchSection}>
            {/* <Text variant="bodyMedium" style={styles.subtitle}>
            Join arenas created by other users
          </Text> */}

            <Searchbar
              placeholder="Search arenas..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={[styles.searchbar, { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.inputBorder,
                borderWidth: 1,
                borderRadius: 8,
              }]}
              inputStyle={[styles.searchInput, { color: theme.primaryText }]}
              placeholderTextColor={theme.placeholderText}
              icon="magnify"
              clearIcon="close"
              iconColor={theme.primaryText}
              theme={{
                colors: {
                  onSurfaceVariant: theme.primaryText,
                  primary: theme.primaryButton,
                  surfaceVariant: theme.inputBackground,
                  background: theme.inputBackground,
                  surface: theme.inputBackground,
                  onSurface: theme.primaryText,
                }
              }}
            />
          </View>

          {allArenas.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={[styles.emptyText, { color: theme.primaryText }]}>No arenas found.</Text>
              <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
                Create your first arena to get started!
              </Text>
            </View>
          ) : filteredArenas.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={[styles.emptyText, { color: theme.primaryText }]}>No arenas match your search.</Text>
              <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
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
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
    backgroundColor: "transparent",
  },
  subtitle: {
    color: "#666",
    marginBottom: 16,
  },
  searchbar: {
    elevation: 0,
    borderWidth: 1,
    borderRadius: 12,
  },
  searchInput: {
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
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderWidth: 1,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  arenaDescription: {
    marginBottom: 12,
  },
  arenaMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  frequencyChip: {
  },
  typeChip: {
  },
  targetChip: {
  },
  creatorInfo: {
    marginBottom: 8,
  },
  creatorText: {
    fontStyle: "italic",
  },
  joinButton: {
    marginLeft: "auto",
  },
  joinedButton: {
    marginLeft: "auto",
  },
  ownArenaButton: {
    marginLeft: "auto",
  },
});
