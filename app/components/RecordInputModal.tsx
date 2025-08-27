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
import { useTimeBasedTheme } from "../hooks/useTimeBasedTheme";

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
  const theme = useTimeBasedTheme();

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
            <Text variant="bodyMedium" style={[styles.label, { color: theme.primaryText }]}>
              How much did you complete?
            </Text>
            <TextInput
              label={`Amount (${habit.unit_label || 'units'})`}
              value={numberValue}
              onChangeText={setNumberValue}
              keyboardType="numeric"
              mode="flat"
              style={styles.input}
              textColor={theme.primaryText}
              placeholderTextColor={theme.placeholderText}
              underlineColor={theme.inputBorder}
              activeUnderlineColor={theme.primaryButton}
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
            {habit.target_value && (
              <Text variant="bodySmall" style={[styles.target, { color: theme.secondaryText }]}>
                Target: {habit.target_value}
              </Text>
            )}
          </View>
        );

      case "time":
        return (
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={[styles.label, { color: theme.primaryText }]}>
              How long did you spend?
            </Text>
            <View style={styles.timeInputRow}>
              <TextInput
                label="Hours"
                value={timeHours}
                onChangeText={setTimeHours}
                keyboardType="numeric"
                mode="flat"
                style={styles.timeInput}
                textColor={theme.primaryText}
                placeholderTextColor={theme.placeholderText}
                underlineColor={theme.inputBorder}
                activeUnderlineColor={theme.primaryButton}
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
              <TextInput
                label="Minutes"
                value={timeMinutes}
                onChangeText={setTimeMinutes}
                keyboardType="numeric"
                mode="flat"
                style={styles.timeInput}
                textColor={theme.primaryText}
                placeholderTextColor={theme.placeholderText}
                underlineColor={theme.inputBorder}
                activeUnderlineColor={theme.primaryButton}
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
            {habit.target_value && (
              <Text variant="bodySmall" style={[styles.target, { color: theme.secondaryText }]}>
                Target: {habit.target_value}
              </Text>
            )}
          </View>
        );

      case "boolean":
        return (
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={[styles.label, { color: theme.primaryText }]}>
              {habit.title}?
            </Text>
            <View style={styles.switchContainer}>
              <Text variant="bodyMedium" style={{ color: theme.secondaryText }}>No</Text>
              <Switch
                value={booleanValue}
                onValueChange={setBooleanValue}
                style={styles.switch}
                thumbColor={theme.primaryButton}
                trackColor={{ true: theme.accentColor, false: theme.secondaryButton }}
              />
              <Text variant="bodyMedium" style={{ color: theme.secondaryText }}>Yes</Text>
            </View>
            {habit.target_value && (
              <Text variant="bodySmall" style={[styles.target, { color: theme.secondaryText }]}>
                Target: {habit.target_value}
              </Text>
            )}
          </View>
        );

      case "text":
        return (
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={[styles.label, { color: theme.primaryText }]}>
              What did you accomplish?
            </Text>
            <TextInput
              label={habit.unit_label || "Description"}
              value={textValue}
              onChangeText={setTextValue}
              mode="flat"
              multiline
              numberOfLines={3}
              style={styles.input}
              textColor={theme.primaryText}
              placeholderTextColor={theme.placeholderText}
              underlineColor={theme.inputBorder}
              activeUnderlineColor={theme.primaryButton}
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
            {habit.target_value && (
              <Text variant="bodySmall" style={[styles.target, { color: theme.secondaryText }]}>
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
        <Card style={{ backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }}>
          <Card.Content>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.primaryText }]}>
              Record Progress
            </Text>
            <Text variant="bodyMedium" style={[styles.habitTitle, { color: theme.secondaryText }]}>
              {habit.title}
            </Text>
            
            {renderInput()}
          </Card.Content>
          
          <Card.Actions style={styles.actions}>
            <Button 
              onPress={onDismiss} 
              disabled={isSubmitting}
              textColor={theme.secondaryButtonText}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              buttonColor={theme.primaryButton}
              textColor={theme.primaryButtonText}
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
    borderRadius: 8,
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