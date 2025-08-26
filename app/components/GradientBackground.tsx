import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  try {
    return (
      <LinearGradient
        colors={["#FFF5ED", "#DCD1C8"]}
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
