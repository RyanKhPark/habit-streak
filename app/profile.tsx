import { useAuth } from "@/lib/auth-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
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
import { useTimeBasedTheme } from "./hooks/useTimeBasedTheme";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const theme = useTimeBasedTheme();
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
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.customHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={theme.primaryText}
              />
            </TouchableOpacity>
            <Text
              variant="titleLarge"
              style={[styles.headerTitle, { color: theme.headerText }]}
            >
              Profile
            </Text>
            <View style={styles.headerSpacer} />
          </View>
          <ScrollView style={styles.container}>
            {/* Profile Header */}
            <Card
              style={[
                styles.headerCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
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
                            }&background=${
                              theme.surfaceBackground
                            }&color=fff&size=200`,
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
                  <Text
                    variant="headlineSmall"
                    style={[styles.userName, { color: theme.primaryText }]}
                  >
                    {user?.name || "User"}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={[styles.userEmail, { color: theme.secondaryText }]}
                  >
                    {user?.email}
                  </Text>
                  <View style={styles.joinedInfo}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={16}
                      color={theme.secondaryText}
                    />
                    <Text
                      variant="bodySmall"
                      style={[
                        styles.joinedText,
                        { color: theme.secondaryText },
                      ]}
                    >
                      Joined {userStats.joinedDays} days ago
                    </Text>
                  </View>
                </View>

                <Button
                  mode="outlined"
                  onPress={handleEditProfile}
                  style={styles.editButton}
                  buttonColor={theme.secondaryButton}
                  textColor={theme.secondaryButtonText}
                >
                  Edit Profile
                </Button>
              </Card.Content>
            </Card>

            {/* Stats Overview */}
            <Card
              style={[
                styles.statsCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Card.Content>
                <Text
                  variant="titleMedium"
                  style={[styles.sectionTitle, { color: theme.primaryText }]}
                >
                  Your Progress
                </Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons
                      name="target"
                      size={24}
                      color={theme.accentColor}
                    />
                    <Text
                      variant="titleMedium"
                      style={[styles.statNumber, { color: theme.primaryText }]}
                    >
                      {userStats.totalArenas}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={[styles.statLabel, { color: theme.secondaryText }]}
                    >
                      Total Arenas
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons
                      name="fire"
                      size={24}
                      color={theme.streakColor}
                    />
                    <Text
                      variant="titleMedium"
                      style={[styles.statNumber, { color: theme.primaryText }]}
                    >
                      {userStats.activeStreaks}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={[styles.statLabel, { color: theme.secondaryText }]}
                    >
                      Active Streaks
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons
                      name="trophy"
                      size={24}
                      color={theme.successColor}
                    />
                    <Text
                      variant="titleMedium"
                      style={[styles.statNumber, { color: theme.primaryText }]}
                    >
                      {userStats.longestStreak}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={[styles.statLabel, { color: theme.secondaryText }]}
                    >
                      Best Streak
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Settings */}
            <Card
              style={[
                styles.settingsCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Card.Content>
                <Text
                  variant="titleMedium"
                  style={[styles.sectionTitle, { color: theme.primaryText }]}
                >
                  Settings
                </Text>

                <List.Item
                  title="Push Notifications"
                  description="Get reminders and updates"
                  titleStyle={{ color: theme.primaryText }}
                  descriptionStyle={{ color: theme.secondaryText }}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="bell"
                      color={theme.primaryText}
                    />
                  )}
                  right={() => (
                    <Switch
                      value={notifications}
                      onValueChange={setNotifications}
                      thumbColor={theme.primaryButton}
                      trackColor={{
                        true: theme.accentColor,
                        false: theme.secondaryButton,
                      }}
                    />
                  )}
                />

                <Divider />

                <List.Item
                  title="Private Profile"
                  description="Hide your progress from others"
                  titleStyle={{ color: theme.primaryText }}
                  descriptionStyle={{ color: theme.secondaryText }}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="lock"
                      color={theme.primaryText}
                    />
                  )}
                  right={() => (
                    <Switch
                      value={privateProfile}
                      onValueChange={setPrivateProfile}
                      thumbColor={theme.primaryButton}
                      trackColor={{
                        true: theme.accentColor,
                        false: theme.secondaryButton,
                      }}
                    />
                  )}
                />

                <Divider />

                <List.Item
                  title="Help & Support"
                  description="Get help and contact support"
                  titleStyle={{ color: theme.primaryText }}
                  descriptionStyle={{ color: theme.secondaryText }}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="help-circle"
                      color={theme.primaryText}
                    />
                  )}
                  right={(props) => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={theme.primaryText}
                    />
                  )}
                  onPress={handleSupport}
                />
              </Card.Content>
            </Card>

            {/* Danger Zone */}
            <Card
              style={[
                styles.dangerCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.errorColor,
                },
              ]}
            >
              <Card.Content>
                <Text
                  variant="titleMedium"
                  style={[styles.dangerTitle, { color: theme.errorColor }]}
                >
                  Account Actions
                </Text>

                <Button
                  mode="outlined"
                  onPress={signOut}
                  style={[
                    styles.signOutButton,
                    { borderColor: theme.errorColor },
                  ]}
                  textColor={theme.errorColor}
                >
                  Sign Out
                </Button>
              </Card.Content>
            </Card>

            <View style={styles.footer}>
              <Text
                variant="bodySmall"
                style={[styles.footerText, { color: theme.secondaryText }]}
              >
                Arena Tracker v1.0.0
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </GradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
  },
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  headerContent: {
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {},
  cameraButton: {
    position: "absolute",
    bottom: -5,
    right: -5,
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
    marginBottom: 8,
  },
  joinedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  joinedText: {},
  editButton: {
    minWidth: 120,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
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
    textAlign: "center",
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  dangerCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  dangerTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  signOutButton: {
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {},
});
