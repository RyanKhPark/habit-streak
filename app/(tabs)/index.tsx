import { useAuth } from "@/lib/auth-context";
import {
  useCompleteHabit,
  useDeleteHabit,
  useHabits,
  useTodayCompletions,
} from "@/lib/queries";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { HabitsList } from "../components/HabitsList";
import { RecordInputModal } from "../components/RecordInputModal";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Habit } from "@/types/database.type";

export default function Index() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

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

  const handleCompleteHabit = async (id: string, value?: string, displayValue?: string) => {
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

  const handleModalSubmit = async (habitId: string, value?: string, displayValue?: string) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Today&apos;s Habits
        </Text>
        <Button mode="text" onPress={signOut} icon={"logout"}>
          Sign Out
        </Button>
      </View>

      <HabitsList
        habits={habits}
        completedHabits={completedHabits}
        completions={completions}
        onDeleteHabit={handleDeleteHabit}
        onCompleteHabit={handleCompleteHabit}
      />

      <RecordInputModal
        visible={recordModalVisible}
        habit={selectedHabit}
        onDismiss={() => setRecordModalVisible(false)}
        onSubmit={handleModalSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
  },
});
