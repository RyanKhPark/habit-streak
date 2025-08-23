import { useAuth } from "@/lib/auth-context";
import { useCreateHabit } from "@/lib/queries";
import { UnitType } from "@/types/database.type";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
  Switch,
  Chip,
} from "react-native-paper";

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUENCIES)[number];

const UNIT_TYPES: { value: UnitType; label: string; description: string }[] = [
  { value: "number", label: "Number", description: "km, reps, pages, etc." },
  { value: "time", label: "Time", description: "minutes, hours" },
  { value: "boolean", label: "Yes/No", description: "done/not done" },
  { value: "text", label: "Text", description: "notes, description" },
];

export default function AddHabitScreen() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [unitType, setUnitType] = useState<UnitType>("boolean");
  const [unitLabel, setUnitLabel] = useState<string>("");
  const [targetValue, setTargetValue] = useState<string>("");
  const [requiresInput, setRequiresInput] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const createHabit = useCreateHabit();

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await createHabit.mutateAsync({
        created_by: user.$id,
        title,
        description,
        frequency,
        is_public: true, // All habits are public by default
        unit_type: unitType,
        unit_label: unitLabel || undefined,
        target_value: targetValue || undefined,
        requires_input: requiresInput,
      });

      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }

      setError("There was an error creating the habit");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Title"
        mode="outlined"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        label="Description"
        mode="outlined"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      
      <View style={styles.frequencyContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Frequency</Text>
        <SegmentedButtons
          value={frequency}
          onValueChange={(value) => setFrequency(value as Frequency)}
          buttons={FREQUENCIES.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))}
        />
      </View>

      <View style={styles.unitTypeContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>How to track progress?</Text>
        <View style={styles.chipContainer}>
          {UNIT_TYPES.map((type) => (
            <Chip
              key={type.value}
              selected={unitType === type.value}
              onPress={() => {
                setUnitType(type.value);
                setRequiresInput(type.value !== 'boolean');
              }}
              style={styles.chip}
            >
              {type.label}
            </Chip>
          ))}
        </View>
        <Text variant="bodySmall" style={styles.unitDescription}>
          {UNIT_TYPES.find(t => t.value === unitType)?.description}
        </Text>
      </View>

      {(unitType === 'number' || unitType === 'text') && (
        <TextInput
          label="Unit Label (e.g., km, pages, chapters)"
          mode="outlined"
          value={unitLabel}
          onChangeText={setUnitLabel}
          style={styles.input}
        />
      )}

      <TextInput
        label="Target Value (optional)"
        mode="outlined"
        value={targetValue}
        onChangeText={setTargetValue}
        placeholder={unitType === 'number' ? '5 km' : unitType === 'time' ? '30 minutes' : unitType === 'boolean' ? 'Yes' : 'Daily reflection'}
        style={styles.input}
      />

      <View style={styles.switchContainer}>
        <Text variant="bodyMedium">Requires input when completing</Text>
        <Switch
          value={requiresInput}
          onValueChange={setRequiresInput}
        />
      </View>
      
      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={!title || !description || createHabit.isPending}
        loading={createHabit.isPending}
        style={styles.submitButton}
      >
        Add Habit
      </Button>
      {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },

  input: {
    marginBottom: 16,
  },

  frequencyContainer: {
    marginBottom: 24,
  },

  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },

  unitTypeContainer: {
    marginBottom: 24,
  },

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },

  chip: {
    marginRight: 4,
    marginBottom: 4,
  },

  unitDescription: {
    color: '#666',
    fontStyle: 'italic',
  },

  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },

  submitButton: {
    marginTop: 16,
  },
});
