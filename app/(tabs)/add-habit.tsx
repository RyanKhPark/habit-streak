import { useAuth } from "@/lib/auth-context";
import { useCreateHabit } from "@/lib/queries";
import { UnitType } from "@/types/database.type";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  Button,
  Chip,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { AppHeader } from "../../components/AppHeader";
import { GradientBackground } from "../../components/GradientBackground";
import { useTimeBasedTheme } from "../../hooks/useTimeBasedTheme";

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUENCIES)[number];

const UNIT_TYPES: { value: UnitType; label: string; description: string }[] = [
  { value: "number", label: "Number", description: "km, reps, pages, etc." },
  { value: "time", label: "Time", description: "minutes, hours" },
  { value: "boolean", label: "Yes/No", description: "done/not done" },
  { value: "text", label: "Text", description: "notes, description" },
];

export default function AddArenaScreen() {
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
  const theme = useTimeBasedTheme();
  const createHabit = useCreateHabit();
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await createHabit.mutateAsync({
        created_by: user.$id,
        title,
        description,
        frequency,
        is_public: true, // All arenas are public by default
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

      setError("There was an error creating the arena");
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 80 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            label="Title"
            mode="flat"
            value={title}
            onChangeText={setTitle}
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
              },
            }}
          />
          <TextInput
            label="Description"
            mode="flat"
            value={description}
            onChangeText={setDescription}
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
              },
            }}
          />

          <View style={styles.frequencyContainer}>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.primaryText }]}
            >
              Frequency
            </Text>
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
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.primaryText }]}
            >
              How to track progress?
            </Text>
            <View style={styles.chipContainer}>
              {UNIT_TYPES.map((type) => (
                <Chip
                  key={type.value}
                  selected={unitType === type.value}
                  onPress={() => {
                    setUnitType(type.value);
                    setRequiresInput(type.value !== "boolean");
                  }}
                  style={styles.chip}
                >
                  {type.label}
                </Chip>
              ))}
            </View>
            <Text
              variant="bodySmall"
              style={[styles.unitDescription, { color: theme.secondaryText }]}
            >
              {UNIT_TYPES.find((t) => t.value === unitType)?.description}
            </Text>
          </View>

          {(unitType === "number" || unitType === "text") && (
            <TextInput
              label="Unit Label (e.g., km, pages, chapters)"
              mode="flat"
              value={unitLabel}
              onChangeText={setUnitLabel}
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
                },
              }}
            />
          )}

          <TextInput
            label="Target Value (optional)"
            mode="flat"
            value={targetValue}
            onChangeText={setTargetValue}
            placeholder={
              unitType === "number"
                ? "5 km"
                : unitType === "time"
                ? "30 minutes"
                : unitType === "boolean"
                ? "Yes"
                : "Daily reflection"
            }
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
              },
            }}
          />

          <View style={styles.switchContainer}>
            <Text variant="bodyMedium" style={{ color: theme.primaryText }}>
              Requires input when completing
            </Text>
            <Switch
              value={requiresInput}
              onValueChange={setRequiresInput}
              thumbColor={theme.primaryButton}
              trackColor={{
                true: theme.accentColor,
                false: theme.secondaryButton,
              }}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={!title || !description || createHabit.isPending}
            loading={createHabit.isPending}
            style={styles.submitButton}
          >
            <Text variant="titleMedium" style={{ color: theme.primaryText }}>
              Add Arena
            </Text>
          </Button>
          {error && <Text style={{ color: theme.errorColor }}>{error}</Text>}
        </ScrollView>
        <AppHeader title="Add Arena" fixed />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  input: {
    marginBottom: 16,
    borderRadius: 8,
  },

  frequencyContainer: {
    marginBottom: 24,
  },

  sectionTitle: {
    marginBottom: 12,
    fontWeight: "bold",
  },

  unitTypeContainer: {
    marginBottom: 24,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },

  chip: {
    marginRight: 4,
    marginBottom: 4,
  },

  unitDescription: {
    fontStyle: "italic",
  },

  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 8,
  },

  submitButton: {
    marginTop: 8,
    marginBottom: 50,
  },
});
