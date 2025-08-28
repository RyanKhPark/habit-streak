import { Habit, HabitCompletion } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Surface, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useTimeBasedTheme } from "../hooks/useTimeBasedTheme";

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  lastCompletion?: HabitCompletion;
}

export function HabitCard({ habit, isCompleted, lastCompletion }: HabitCardProps) {
  const router = useRouter();
  const theme = useTimeBasedTheme();
  
  const formatLastValue = (completion: HabitCompletion) => {
    return completion.display_value || completion.value || null;
  };

  const handlePress = () => {
    router.push(`/habit-records/${habit.$id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Surface
        style={[
          styles.card, 
          { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
          isCompleted && styles.cardCompleted
        ]}
        elevation={0}
      >
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: theme.primaryText }]}>{habit.title}</Text>
        <Text style={[styles.cardDescription, { color: theme.secondaryText }]}>{habit.description}</Text>
        
        {/* Show last recorded value for habits that require input */}
        {habit.requires_input === true && lastCompletion && (
          <View style={[styles.lastRecordContainer, { backgroundColor: theme.surfaceBackground }]}>
            <Text style={[styles.lastRecordLabel, { color: theme.successColor }]}>Last record:</Text>
            <Text style={[styles.lastRecordValue, { color: theme.completionColor }]}>
              {formatLastValue(lastCompletion)}
            </Text>
          </View>
        )}
        
        <View style={styles.cardFooter}>
          <View style={[styles.streakBadge, { backgroundColor: theme.surfaceBackground }]}>
            <MaterialCommunityIcons name="fire" size={18} color={theme.streakColor} />
            <Text style={[styles.streakText, { color: theme.secondaryText }]}>
              {(habit as any).user_streak_count || 0} day streak
            </Text>
          </View>
          <View style={[styles.frequencyBadge, { backgroundColor: theme.surfaceBackground }]}>
            <Text style={[styles.frequencyText, { color: theme.secondaryText }]}>
              {habit.frequency.charAt(0).toUpperCase() +
                habit.frequency.slice(1)}
            </Text>
          </View>
          {habit.participant_count && (
            <View style={[styles.participantBadge, { backgroundColor: theme.surfaceBackground }]}>
              <MaterialCommunityIcons name="account-group" size={16} color={theme.accentColor} />
              <Text style={[styles.participantText, { color: theme.secondaryText }]}>
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
    borderWidth: 1,
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
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
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
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakText: {
    marginLeft: 4,
    fontWeight: "500",
    fontSize: 12,
  },
  frequencyBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  frequencyText: {
    fontWeight: "500",
    fontSize: 12,
  },
  lastRecordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  lastRecordLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginRight: 8,
  },
  lastRecordValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  participantBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  participantText: {
    marginLeft: 4,
    fontWeight: "500",
    fontSize: 12,
  },
});
