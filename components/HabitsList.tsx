import { Habit, HabitCompletion } from "@/types/database.type";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SwipeableHabit } from "./SwipeableHabit";

interface HabitsListProps {
  habits: Habit[];
  completedHabits: string[];
  completions: HabitCompletion[];
  onDeleteHabit: (id: string) => void;
  onCompleteHabit: (id: string) => void;
  onFocusChange?: (isFocused: boolean) => void;
}

export function HabitsList({
  habits,
  completedHabits,
  completions,
  onDeleteHabit,
  onCompleteHabit,
  onFocusChange: parentOnFocusChange,
}: HabitsListProps) {
  const [anyInputFocused, setAnyInputFocused] = useState(false);

  const getLastCompletion = (habitId: string) => {
    return completions
      .filter(c => c.habit_id === habitId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];
  };

  const handleFocusChange = (isFocused: boolean) => {
    setAnyInputFocused(isFocused);
    parentOnFocusChange?.(isFocused);
  };

  if (habits.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>
          No Habits yet. Add your first Habit!
        </Text>
      </View>
    );
  }

  return (
    <>
      {habits.map((habit) => (
        <SwipeableHabit
          key={habit.$id}
          habit={habit}
          isCompleted={completedHabits.includes(habit.$id)}
          lastCompletion={getLastCompletion(habit.$id)}
          onDelete={onDeleteHabit}
          onComplete={onCompleteHabit}
          onFocusChange={handleFocusChange}
        />
      ))}
      
    </>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "500",
  },
});
