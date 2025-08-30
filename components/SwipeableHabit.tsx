import { Habit, HabitCompletion } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import { HabitCard } from "./HabitCard";
import { useTimeBasedTheme } from "../hooks/useTimeBasedTheme";

interface SwipeableHabitProps {
  habit: Habit;
  isCompleted: boolean;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  lastCompletion?: HabitCompletion;
  onFocusChange?: (isFocused: boolean) => void;
}

export function SwipeableHabit({
  habit,
  isCompleted,
  onDelete,
  onComplete,
  lastCompletion,
  onFocusChange,
}: SwipeableHabitProps) {
  const swipeableRef = useRef<Swipeable | null>(null);
  const theme = useTimeBasedTheme();

  const renderRightActions = () => (
    <View style={[styles.swipeActionRight, { backgroundColor: theme.completionColor }]}>
      {isCompleted ? (
        <Text style={{ color: theme.primaryButtonText }}>Completed!</Text>
      ) : (
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color={theme.primaryButtonText}
        />
      )}
    </View>
  );

  const renderLeftActions = () => (
    <View style={[styles.swipeActionLeft, { backgroundColor: theme.errorColor }]}>
      <MaterialCommunityIcons
        name="trash-can-outline"
        size={32}
        color={theme.primaryButtonText}
      />
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        if (direction === "left") {
          onDelete(habit.$id);
        } else if (direction === "right") {
          onComplete(habit.$id);
        }
        swipeableRef.current?.close();
      }}
    >
      <HabitCard 
        habit={habit} 
        isCompleted={isCompleted} 
        lastCompletion={lastCompletion} 
        onFocusChange={onFocusChange}
      />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeActionLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    borderRadius: 16,
    marginBottom: 16,
    marginTop: 0,
    paddingLeft: 16,
  },
  swipeActionRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    borderRadius: 16,
    marginBottom: 16,
    marginTop: 0,
    paddingRight: 16,
  },
});
