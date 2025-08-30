import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTimeBasedTheme } from "../hooks/useTimeBasedTheme";

interface GradientBackgroundProps {
  children: React.ReactNode;
  dimmed?: boolean;
}

export function GradientBackground({ children, dimmed = false }: GradientBackgroundProps) {
  const theme = useTimeBasedTheme();
  const colors = dimmed 
    ? ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)'] // Dark dimmed colors
    : theme.gradientColors; // Normal gradient colors

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
