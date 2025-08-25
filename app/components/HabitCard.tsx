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
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardCompleted: {
    opacity: 0.6,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
  },
  cardDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: "#6c6c80",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 14,
  },
  frequencyBadge: {
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  frequencyText: {
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize: 14,
  },
  lastRecordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
  },
  lastRecordLabel: {
    fontSize: 13,
    color: "#4caf50",
    fontWeight: "500",
    marginRight: 8,
  },
  lastRecordValue: {
    fontSize: 13,
    color: "#2e7d32",
    fontWeight: "bold",
  },
  participantBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  participantText: {
    marginLeft: 4,
    color: "#2196f3",
    fontWeight: "bold",
    fontSize: 14,
  },
});
