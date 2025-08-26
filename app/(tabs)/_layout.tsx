import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: "#f5f5f5" },
          headerShadowVisible: false,
          tabBarStyle: {
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            position: "absolute",
          },
          tabBarActiveTintColor: "#6200ee",
          tabBarInactiveTintColor: "#666666",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="calendar-today"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="streaks"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="chart-line"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="add-habit"
          options={{
            title: "Open Arena",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="plus-circle"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="browse-habits"
          options={{
            title: "Arenas",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="compass"
                size={size}
                color={color}
              />
            ),
          }}
        />
    </Tabs>
  );
}
