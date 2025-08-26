import { Habit, HabitCompletion } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Surface, Text } from "react-native-paper";
import { useRouter } from "expo-router";

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  lastCompletion?: HabitCompletion;
}

export function HabitCard({ habit, isCompleted, lastCompletion }: HabitCardProps) {
  const router = useRouter();
  
  const formatLastValue = (completion: HabitCompletion) => {
    return completion.display_value || completion.value || null;
  };

  const handlePress = () => {
    router.push(`/habit-records/${habit.$id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Surface
        style={[styles.card, isCompleted && styles.cardCompleted]}
        elevation={0}
      >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{habit.title}</Text>
        <Text style={styles.cardDescription}>{habit.description}</Text>
        
        {/* Show last recorded value for habits that require input */}
        {habit.requires_input === true && lastCompletion && (
          <View style={styles.lastRecordContainer}>
            <Text style={styles.lastRecordLabel}>Last record:</Text>
            <Text style={styles.lastRecordValue}>
              {formatLastValue(lastCompletion)}
            </Text>
          </View>
        )}
        
        <View style={styles.cardFooter}>
          <View style={styles.streakBadge}>
            <MaterialCommunityIcons name="fire" size={18} color={"#ff9800"} />
            <Text style={styles.streakText}>
              {(habit as any).user_streak_count || 0} day streak
            </Text>
          </View>
          <View style={styles.frequencyBadge}>
            <Text style={styles.frequencyText}>
              {habit.frequency.charAt(0).toUpperCase() +
                habit.frequency.slice(1)}
            </Text>
          </View>
          {habit.participant_count && (
            <View style={styles.participantBadge}>
              <MaterialCommunityIcons name="account-group" size={16} color={"#2196f3"} />
              <Text style={styles.participantText}>
                {habit.participant_count}
              </Text>
            </View>
          )}
        </View>
      </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2d2d2d",
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
    color: "#7a7a7a",
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakText: {
    marginLeft: 4,
    color: "#666",
    fontWeight: "500",
    fontSize: 12,
  },
  frequencyBadge: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  frequencyText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 12,
  },
  lastRecordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f0f9f0",
    borderRadius: 6,
  },
  lastRecordLabel: {
    fontSize: 12,
    color: "#6b8e6b",
    fontWeight: "500",
    marginRight: 8,
  },
  lastRecordValue: {
    fontSize: 12,
    color: "#4a7c59",
    fontWeight: "600",
  },
  participantBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  participantText: {
    marginLeft: 4,
    color: "#666",
    fontWeight: "500",
    fontSize: 12,
  },
});
