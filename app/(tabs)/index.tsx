import { useAuth } from "@/lib/auth-context";
import {
  useCompleteHabit,
  useDeleteHabit,
  useHabits,
  useTodayCompletions,
} from "@/lib/queries";
import { Habit } from "@/types/database.type";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { GradientBackground } from "../../components/GradientBackground";
import { HabitsList } from "../../components/HabitsList";
import { RecordInputModal } from "../../components/RecordInputModal";

export default function Index() {
  const { user } = useAuth();
  const router = useRouter();

  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [anyInputFocused, setAnyInputFocused] = useState(false);

  const { data: habits = [] } = useHabits(user?.$id ?? "");
  const { data: completions = [] } = useTodayCompletions(user?.$id ?? "");
  const deleteHabit = useDeleteHabit();
  const completeHabit = useCompleteHabit();

  const completedHabits = completions.map((c) => c.habit_id);

  const handleDeleteHabit = async (id: string) => {
    try {
      await deleteHabit.mutateAsync(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteHabit = async (
    id: string,
    value?: string,
    displayValue?: string
  ) => {
    if (!user || completedHabits?.includes(id)) return;

    const habit = habits?.find((h) => h.$id === id);
    if (!habit) return;

    // For habits that require input, show modal first
    if (habit.requires_input === true && value === undefined) {
      setSelectedHabit(habit);
      setRecordModalVisible(true);
      return;
    }

    try {
      await completeHabit.mutateAsync({
        habitId: id,
        userId: user.$id,
        value,
        displayValue,
      });

      // Navigate to records screen after completion
      router.push(`/habit-records/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalSubmit = async (
    habitId: string,
    value?: string,
    displayValue?: string
  ) => {
    try {
      if (!user) return;

      await completeHabit.mutateAsync({
        habitId,
        userId: user.$id,
        value,
        displayValue,
      });

      // Navigate to records screen after successful completion
      router.push(`/habit-records/${habitId}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFocusChange = (isFocused: boolean) => {
    setAnyInputFocused(isFocused);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <AppHeader title="Get alerts for new actions" />

        <View style={styles.content}>
          <HabitsList
            habits={habits}
            completedHabits={completedHabits}
            completions={completions}
            onDeleteHabit={handleDeleteHabit}
            onCompleteHabit={handleCompleteHabit}
            onFocusChange={handleFocusChange}
          />

          <RecordInputModal
            visible={recordModalVisible}
            habit={selectedHabit}
            onDismiss={() => setRecordModalVisible(false)}
            onSubmit={handleModalSubmit}
          />
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
    paddingHorizontal: 16,
  },
});
