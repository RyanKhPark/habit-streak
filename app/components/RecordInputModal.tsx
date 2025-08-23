import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Card,
  Switch,
} from "react-native-paper";
import { Habit } from "@/types/database.type";
import { useRouter } from "expo-router";

interface RecordInputModalProps {
  visible: boolean;
  habit: Habit | null;
  onDismiss: () => void;
  onSubmit: (habitId: string, value?: string, displayValue?: string) => Promise<void>;
}

export function RecordInputModal({
  visible,
  habit,
  onDismiss,
  onSubmit,
}: RecordInputModalProps) {
  const [numberValue, setNumberValue] = useState("");
  const [timeHours, setTimeHours] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [booleanValue, setBooleanValue] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!habit || isSubmitting) return;

    try {
      setIsSubmitting(true);

      let value: string;
      let displayValue: string;

      const unitType = habit.unit_type || 'boolean';

      switch (unitType) {
        case "number":
          const numVal = parseFloat(numberValue);
          if (isNaN(numVal) || numVal <= 0) return;
          value = numVal.toString();
          displayValue = `${numVal} ${habit.unit_label || 'units'}`;
          break;

        case "time":
          const hours = parseInt(timeHours) || 0;
          const minutes = parseInt(timeMinutes) || 0;
          if (hours === 0 && minutes === 0) return;
          
          // Store as total minutes for easy calculations
          value = (hours * 60 + minutes).toString();
          
          // Format display value
          if (hours > 0 && minutes > 0) {
            displayValue = `${hours}h ${minutes}m`;
          } else if (hours > 0) {
            displayValue = `${hours}h`;
          } else {
            displayValue = `${minutes}m`;
          }
          break;

        case "boolean":
          value = booleanValue.toString();
          displayValue = booleanValue ? "Yes" : "No";
          break;

        case "text":
          if (!textValue.trim()) return;
          value = textValue.trim();
          displayValue = textValue.trim();
          break;

        default:
          return;
      }

      // Submit the data
      await onSubmit(habit.$id, value, displayValue);
      
      // Clean up the modal
      resetForm();
      onDismiss();
    } catch (error) {
      console.error('Error submitting record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNumberValue("");
    setTimeHours("");
    setTimeMinutes("");
    setBooleanValue(false);
    setTextValue("");
  };

  const renderInput = () => {
    if (!habit) return null;

    const unitType = habit.unit_type || 'boolean';

    switch (unitType) {
      case "number":
        return (
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              How much did you complete?
            </Text>
            <TextInput
              label={`Amount (${habit.unit_label || 'units'})`}
              value={numberValue}
              onChangeText={setNumberValue}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            {habit.target_value && (
              <Text variant="bodySmall" style={styles.target}>
                Target: {habit.target_value}
              </Text>
            )}
          </View>
        );

      case "time":
        return (
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              How long did you spend?
            </Text>
            <View style={styles.timeInputRow}>
              <TextInput
                label="Hours"
                value={timeHours}
                onChangeText={setTimeHours}
                keyboardType="numeric"
                mode="outlined"
                style={styles.timeInput}
              />
              <TextInput
                label="Minutes"
                value={timeMinutes}
                onChangeText={setTimeMinutes}
                keyboardType="numeric"
                mode="outlined"
                style={styles.timeInput}
              />
            </View>
            {habit.target_value && (
              <Text variant="bodySmall" style={styles.target}>
                Target: {habit.target_value}
              </Text>
            )}
          </View>
        );

      case "boolean":
        return (
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              {habit.title}?
            </Text>
            <View style={styles.switchContainer}>
              <Text variant="bodyMedium">No</Text>
              <Switch
                value={booleanValue}
                onValueChange={setBooleanValue}
                style={styles.switch}
              />
              <Text variant="bodyMedium">Yes</Text>
            </View>
            {habit.target_value && (
              <Text variant="bodySmall" style={styles.target}>
                Target: {habit.target_value}
              </Text>
            )}
          </View>
        );

      case "text":
        return (
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              What did you accomplish?
            </Text>
            <TextInput
              label={habit.unit_label || "Description"}
              value={textValue}
              onChangeText={setTextValue}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            {habit.target_value && (
              <Text variant="bodySmall" style={styles.target}>
                Target: {habit.target_value}
              </Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (!habit) return null;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Card>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Record Progress
            </Text>
            <Text variant="bodyMedium" style={styles.habitTitle}>
              {habit.title}
            </Text>
            
            {renderInput()}
          </Card.Content>
          
          <Card.Actions style={styles.actions}>
            <Button onPress={onDismiss} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Complete
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    padding: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  habitTitle: {
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  timeInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginVertical: 12,
  },
  switch: {
    marginHorizontal: 8,
  },
  target: {
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
  actions: {
    justifyContent: "flex-end",
  },
});