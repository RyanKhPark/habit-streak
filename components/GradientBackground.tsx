import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTimeBasedTheme } from "../hooks/useTimeBasedTheme";

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  const theme = useTimeBasedTheme();
  const colors = theme.gradientColors;

  try {

    return (
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    );
  } catch (error) {
    console.warn(
      "LinearGradient error, falling back to solid background:",
      error
    );
    return <View style={styles.fallback}>{children}</View>;
  }
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    backgroundColor: "#f5f1eb",
  },
});
