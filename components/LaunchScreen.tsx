import React from "react";
import { View, StyleSheet } from "react-native";

interface LaunchScreenProps {
  backgroundColor?: string;
}

export default function LaunchScreen({ backgroundColor = "#FFF" }: LaunchScreenProps) {
  return (
    <View style={[styles.container, { backgroundColor }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});