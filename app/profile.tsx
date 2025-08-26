import { useAuth } from "@/lib/auth-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Switch,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientBackground } from "./components/GradientBackground";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);

  // Mock subscription data - replace with real data later
  const subscriptionStatus = {
    plan: "Premium",
    status: "active",
    nextBilling: "2024-02-15",
    price: "$9.99/month",
  };

  // Mock user stats - replace with real queries later
  const userStats = {
    totalArenas: 12,
    activeStreaks: 5,
    longestStreak: 45,
    joinedDays: 127,
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        // TODO: Upload to server/storage
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing coming soon!");
  };

  const handleBilling = () => {
    Alert.alert("Billing", "Billing management coming soon!");
  };

  const handleSupport = () => {
    Alert.alert("Support", "Support center coming soon!");
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
          />
          <Text variant="titleLarge" style={styles.headerTitle}>
            Profile
          </Text>
          <View style={{ width: 48 }} />
        </View> */}

        <ScrollView style={styles.container}>
          {/* Profile Header */}
          <Card style={styles.headerCard}>
            <Card.Content style={styles.headerContent}>
              <View style={styles.profileImageContainer}>
                <Avatar.Image
                  size={100}
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : {
                          uri: `https://ui-avatars.com/api/?name=${
                            user?.name || "User"
                          }&background=7c4dff&color=fff&size=200`,
                        }
                  }
                  style={styles.profileImage}
                />
                <IconButton
                  icon="camera"
                  size={20}
                  mode="contained"
                  onPress={handleImagePicker}
                  style={styles.cameraButton}
                />
              </View>

              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={styles.userName}>
                  {user?.name || "User"}
                </Text>
                <Text variant="bodyMedium" style={styles.userEmail}>
                  {user?.email}
                </Text>
                <View style={styles.joinedInfo}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color="#666"
                  />
                  <Text variant="bodySmall" style={styles.joinedText}>
                    Joined {userStats.joinedDays} days ago
                  </Text>
                </View>
              </View>

              <Button
                mode="outlined"
                onPress={handleEditProfile}
                style={styles.editButton}
              >
                Edit Profile
              </Button>
            </Card.Content>
          </Card>

          {/* Stats Overview */}
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Your Progress
              </Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="target"
                    size={24}
                    color="#7c4dff"
                  />
                  <Text variant="titleMedium" style={styles.statNumber}>
                    {userStats.totalArenas}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Total Arenas
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={24}
                    color="#ff9800"
                  />
                  <Text variant="titleMedium" style={styles.statNumber}>
                    {userStats.activeStreaks}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Active Streaks
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="trophy"
                    size={24}
                    color="#4caf50"
                  />
                  <Text variant="titleMedium" style={styles.statNumber}>
                    {userStats.longestStreak}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Best Streak
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Settings */}
          <Card style={styles.settingsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Settings
              </Text>

              <List.Item
                title="Push Notifications"
                description="Get reminders and updates"
                left={(props) => <List.Icon {...props} icon="bell" />}
                right={() => (
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                  />
                )}
              />

              <Divider />

              <List.Item
                title="Private Profile"
                description="Hide your progress from others"
                left={(props) => <List.Icon {...props} icon="lock" />}
                right={() => (
                  <Switch
                    value={privateProfile}
                    onValueChange={setPrivateProfile}
                  />
                )}
              />

              <Divider />

              <List.Item
                title="Help & Support"
                description="Get help and contact support"
                left={(props) => <List.Icon {...props} icon="help-circle" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleSupport}
              />
            </Card.Content>
          </Card>

          {/* Danger Zone */}
          <Card style={styles.dangerCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.dangerTitle}>
                Account Actions
              </Text>

              <Button
                mode="outlined"
                onPress={signOut}
                style={styles.signOutButton}
                textColor="#d32f2f"
              >
                Sign Out
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Text variant="bodySmall" style={styles.footerText}>
              Arena Tracker v1.0.0
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: "600",
    color: "#2d2d2d",
  },
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 12,
  },
  headerContent: {
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    backgroundColor: "#7c4dff",
  },
  cameraButton: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#7c4dff",
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    color: "#666",
    marginBottom: 8,
  },
  joinedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  joinedText: {
    color: "#666",
  },
  editButton: {
    minWidth: 120,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: "#666",
    textAlign: "center",
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  dangerCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderColor: "#ffcdd2",
    borderWidth: 1,
  },
  dangerTitle: {
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 16,
  },
  signOutButton: {
    borderColor: "#d32f2f",
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    color: "#999",
  },
});
