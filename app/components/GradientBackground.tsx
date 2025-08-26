import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

interface GradientBackgroundProps {
  children: React.ReactNode;
}

const getTimeBasedColors = (): [string, string, ...string[]] => {
  const now = new Date();
  const hour = now.getHours();

  // Morning: 6:00-11:59 - Warm sunrise colors
  if (hour >= 6 && hour < 12) {
    return ["#EFE7F3", "#FFDCD4"];
  }

  // Afternoon: 12:00-17:59 - Bright daylight colors
  if (hour >= 12 && hour < 18) {
    return ["#FFF5ED", "#DCD1C8"];
  }

  // Evening: 18:00-23:59 - Sunset/dusk colors
  if (hour >= 18 && hour < 24) {
    return ["#9F8A82", "#514357"];
  }

  // Night: 00:00-05:59 - Dark/moonlight colors
  return ["#373243", "#574C43"];
};

export function GradientBackground({ children }: GradientBackgroundProps) {
  try {
    const colors = getTimeBasedColors();

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
