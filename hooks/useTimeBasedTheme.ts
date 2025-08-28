import { useMemo } from "react";

export interface TimeBasedTheme {
  // Background gradients
  gradientColors: [string, string];

  // Card and surface colors
  cardBackground: string;
  cardBorder: string;
  surfaceBackground: string;

  // Text colors
  primaryText: string;
  secondaryText: string;
  headerText: string;

  // Button and interactive colors
  primaryButton: string;
  primaryButtonText: string;
  secondaryButton: string;
  secondaryButtonText: string;

  // Navigation colors
  tabBarBackground: string;
  activeTabColor: string;
  inactiveTabColor: string;

  // Status and accent colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  accentColor: string;

  // Input and form colors
  inputBackground: string;
  inputBorder: string;
  placeholderText: string;

  // Progress and completion colors
  progressColor: string;
  completionColor: string;
  streakColor: string;
}

const getTimeBasedTheme = (): TimeBasedTheme => {
  const now = new Date();
  const hour = now.getHours();

  // Morning: 6:00-11:59 - Light, warm, energetic colors
  if (hour >= 6 && hour < 12) {
    return {
      gradientColors: ["#EFE7F3", "#FFDCD4"],
      cardBackground: "rgba(255, 255, 255, 0.9)",
      cardBorder: "rgba(239, 231, 243, 0.8)",
      surfaceBackground: "rgba(255, 240, 245, 0.7)",
      primaryText: "#2D2D2D",
      secondaryText: "#666666",
      headerText: "#2D2D2D",
      primaryButton: "#D4A5A5",
      primaryButtonText: "#FFFFFF",
      secondaryButton: "rgba(212, 165, 165, 0.2)",
      secondaryButtonText: "#D4A5A5",
      tabBarBackground: "rgba(255, 255, 255, 0.9)",
      activeTabColor: "#D4A5A5",
      inactiveTabColor: "#999999",
      successColor: "#A5D4A5",
      warningColor: "#D4C5A5",
      errorColor: "#D4A5A5",
      accentColor: "#E8B4CB",
      inputBackground: "rgba(255, 255, 255, 0.8)",
      inputBorder: "rgba(212, 165, 165, 0.3)",
      placeholderText: "#999999",
      progressColor: "#D4A5A5",
      completionColor: "#A5D4A5",
      streakColor: "#E8B4CB",
    };
  }

  // Afternoon: 12:00-17:59 - Warm, comfortable, productive colors
  if (hour >= 12 && hour < 18) {
    return {
      gradientColors: ["#FFF5ED", "#DCD1C8"],
      cardBackground: "rgba(255, 255, 255, 0.95)",
      cardBorder: "rgba(220, 209, 200, 0.8)",
      surfaceBackground: "rgba(255, 248, 240, 0.7)",
      primaryText: "#2D2D2D",
      secondaryText: "#5D5D5D",
      headerText: "#2D2D2D",
      primaryButton: "#B8A082",
      primaryButtonText: "#FFFFFF",
      secondaryButton: "rgba(184, 160, 130, 0.2)",
      secondaryButtonText: "#B8A082",
      tabBarBackground: "rgba(255, 255, 255, 0.95)",
      activeTabColor: "#B8A082",
      inactiveTabColor: "#888888",
      successColor: "#82B882",
      warningColor: "#B8A082",
      errorColor: "#B88282",
      accentColor: "#C8B5A0",
      inputBackground: "rgba(255, 255, 255, 0.9)",
      inputBorder: "rgba(184, 160, 130, 0.3)",
      placeholderText: "#888888",
      progressColor: "#B8A082",
      completionColor: "#82B882",
      streakColor: "#C8B5A0",
    };
  }

  // Evening: 18:00-23:59 - Warm, cozy, relaxing colors
  if (hour >= 18 && hour < 24) {
    return {
      gradientColors: ["#9F8A82", "#514357"],
      cardBackground: "rgba(81, 67, 87, 0.9)",
      cardBorder: "rgba(159, 138, 130, 0.6)",
      surfaceBackground: "rgba(81, 67, 87, 0.7)",
      primaryText: "#F5F5F5",
      secondaryText: "#CCCCCC",
      headerText: "#F5F5F5",
      primaryButton: "#9F8A82",
      primaryButtonText: "#FFFFFF",
      secondaryButton: "rgba(159, 138, 130, 0.3)",
      secondaryButtonText: "#9F8A82",
      tabBarBackground: "rgba(81, 67, 87, 0.95)",
      activeTabColor: "#9F8A82",
      inactiveTabColor: "#AAAAAA",
      successColor: "#82A582",
      warningColor: "#A59982",
      errorColor: "#A58282",
      accentColor: "#8A7B82",
      inputBackground: "rgba(81, 67, 87, 0.8)",
      inputBorder: "rgba(159, 138, 130, 0.4)",
      placeholderText: "#AAAAAA",
      progressColor: "#9F8A82",
      completionColor: "#82A582",
      streakColor: "#8A7B82",
    };
  }

  // Dawn/Night: 00:00-05:59 - Deep, calm, mysterious colors
  return {
    gradientColors: ["#373243", "#574C43"],
    cardBackground: "rgba(87, 76, 67, 0.9)",
    cardBorder: "rgba(55, 50, 67, 0.6)",
    surfaceBackground: "rgba(87, 76, 67, 0.7)",
    primaryText: "#E5E5E5",
    secondaryText: "#BBBBBB",
    headerText: "#E5E5E5",
    primaryButton: "#574C43",
    primaryButtonText: "#FFFFFF",
    secondaryButton: "rgba(87, 76, 67, 0.3)",
    secondaryButtonText: "#8A7F76",
    tabBarBackground: "rgba(87, 76, 67, 0.95)",
    activeTabColor: "#8A7F76",
    inactiveTabColor: "#999999",
    successColor: "#6B8B6B",
    warningColor: "#8B8B6B",
    errorColor: "#8B6B6B",
    accentColor: "#6B6B6B",
    inputBackground: "rgba(87, 76, 67, 0.8)",
    inputBorder: "rgba(87, 76, 67, 0.4)",
    placeholderText: "#999999",
    progressColor: "#8A7F76",
    completionColor: "#6B8B6B",
    streakColor: "#6B6B6B",
  };
};

export const useTimeBasedTheme = (): TimeBasedTheme => {
  return useMemo(() => getTimeBasedTheme(), []);
};
