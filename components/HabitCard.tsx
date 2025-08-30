import { useAuth } from "@/lib/auth-context";
import { useCompleteHabit } from "@/lib/queries";
import { Habit, HabitCompletion } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Surface, Text } from "react-native-paper";
import { useTimeBasedTheme } from "../hooks/useTimeBasedTheme";

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  lastCompletion?: HabitCompletion;
}

export function HabitCard({
  habit,
  isCompleted,
  lastCompletion,
}: HabitCardProps) {
  const router = useRouter();
  const theme = useTimeBasedTheme();
  const { user } = useAuth();
  const completeHabit = useCompleteHabit();

  const [inputValue, setInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const formatLastValue = (completion: HabitCompletion) => {
    return completion.display_value || completion.value || null;
  };

  const submitHabitCompletion = async () => {
    if (!user || !inputValue.trim()) return;

    try {
      await completeHabit.mutateAsync({
        habitId: habit.$id,
        userId: user.$id,
        value: inputValue.trim(),
        displayValue: inputValue.trim(),
      });

      // Navigate to habit records after successful submission
      router.push(`/habit-records/${habit.$id}`);

      // Reset input
      setInputValue("");
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to record habit completion. Please try again."
      );
      console.error("Error completing habit:", error);
    }
  };

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      submitHabitCompletion();
    }
  };

  const getInputBackgroundColor = () => {
    if (!inputValue.trim() || !lastCompletion) {
      return theme.surfaceBackground; // Default background
    }

    const currentValue = parseFloat(inputValue.trim());
    const lastValue = parseFloat(lastCompletion.value || "0");

    // Only compare if both values are valid numbers
    if (!isNaN(currentValue) && !isNaN(lastValue)) {
      if (currentValue > lastValue) {
        return theme.successColor; // Green for improvement
      } else if (currentValue < lastValue) {
        return theme.errorColor; // Red for decrease
      }
    }

    return theme.surfaceBackground; // Default background
  };

  const handleOutsidePress = () => {
    if (isInputFocused) {
      Keyboard.dismiss();
      setIsInputFocused(false);
    } else if (!inputValue.trim()) {
      router.push(`/habit-records/${habit.$id}`);
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <Surface
        style={[
          styles.card,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
          },
          isCompleted && styles.cardCompleted,
        ]}
        elevation={0}
      >
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: theme.primaryText }]}>
            {habit.title}
          </Text>

          <View style={styles.cardFooter}>
            <View
              style={[
                styles.streakBadge,
                { backgroundColor: theme.surfaceBackground },
              ]}
            >
              <MaterialCommunityIcons
                name="fire"
                size={18}
                color={theme.streakColor}
              />
              <Text style={[styles.streakText, { color: theme.secondaryText }]}>
                {(habit as any).user_streak_count || 0} day streak
              </Text>
            </View>
            {/* Frequency */}
            {/* <View
              style={[
                styles.frequencyBadge,
                { backgroundColor: theme.surfaceBackground },
              ]}
            >
              <Text
                style={[styles.frequencyText, { color: theme.secondaryText }]}
              >
                {habit.frequency.charAt(0).toUpperCase() +
                  habit.frequency.slice(1)}
              </Text>
            </View> */}
            {habit.participant_count && (
              <View
                style={[
                  styles.participantBadge,
                  { backgroundColor: theme.surfaceBackground },
                ]}
              >
                <MaterialCommunityIcons
                  name="account-group"
                  size={16}
                  color={theme.accentColor}
                />
                <Text
                  style={[
                    styles.participantText,
                    { color: theme.secondaryText },
                  ]}
                >
                  {habit.participant_count}
                </Text>
              </View>
            )}
          </View>

          {/* Input box for habits that require input */}
          {habit.requires_input === true && (
            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: isInputFocused
                    ? theme.primaryText
                    : `${theme.primaryText}4D`,
                },
              ]}
            >
              <TextInput
                ref={inputRef}
                style={[
                  styles.input,
                  {
                    color: isInputFocused
                      ? theme.primaryText
                      : `${theme.primaryText}CC`, // 80% opacity (CC = 204 in hex)
                  },
                ]}
                value={inputValue}
                onChangeText={setInputValue}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onSubmitEditing={handleInputSubmit}
                placeholder={
                  lastCompletion
                    ? `Last: ${formatLastValue(lastCompletion)}`
                    : "Add your record"
                }
                placeholderTextColor={
                  isInputFocused ? theme.primaryText : `${theme.primaryText}CC` // 80% opacity
                }
                keyboardType={
                  habit.unit_type === "number" ? "numeric" : "default"
                }
                returnKeyType="done"
              />
            </View>
          )}

          {/* Show last recorded value for habits that don't require input or when no input is active */}
          {habit.requires_input !== true && lastCompletion && (
            <View
              style={[
                styles.lastRecordContainer,
                { backgroundColor: theme.surfaceBackground },
              ]}
            >
              <Text
                style={[styles.lastRecordLabel, { color: theme.successColor }]}
              >
                Last record:
              </Text>
              <Text
                style={[
                  styles.lastRecordValue,
                  { color: theme.completionColor },
                ]}
              >
                {formatLastValue(lastCompletion)}
              </Text>
            </View>
          )}
        </View>
      </Surface>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 15,
    // borderWidth: 1,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 2,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  cardContent: {
    padding: 16,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 14,
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
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  input: {
    fontSize: 14,
    fontWeight: "500",
    minHeight: 20,
    paddingVertical: 0,
    textAlign: "center",
  },
});
