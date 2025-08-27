import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  IconButton,
} from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { GradientBackground } from "./components/GradientBackground";
import { useTimeBasedTheme } from "./hooks/useTimeBasedTheme";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTimeBasedTheme();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
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
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual profile update
      console.log("Saving profile:", { name, email, bio, location, profileImage });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.back();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container}>
        <Card style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
        <Card.Content>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.primaryText }]}>
            Edit Profile
          </Text>
          
          {/* Profile Image */}
          <View style={styles.imageContainer}>
            <Avatar.Image
              size={120}
              source={
                profileImage
                  ? { uri: profileImage }
                  : { uri: `https://ui-avatars.com/api/?name=${name}&background=7c4dff&color=fff&size=200` }
              }
              style={styles.profileImage}
            />
            <IconButton
              icon="camera"
              size={24}
              mode="contained"
              onPress={handleImagePicker}
              style={[styles.cameraButton, { backgroundColor: theme.primaryButton }]}
              iconColor={theme.primaryButtonText}
            />
          </View>

          {/* Form Fields */}
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="flat"
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
              }
            }}
          />

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            mode="flat"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            disabled // Usually email can't be changed
            textColor={theme.secondaryText}
            placeholderTextColor={theme.placeholderText}
            underlineColor={theme.inputBorder}
            activeUnderlineColor={theme.primaryButton}
            theme={{
              colors: {
                onSurfaceVariant: theme.secondaryText,
                primary: theme.primaryButton,
                surfaceVariant: theme.surfaceBackground,
                background: theme.surfaceBackground,
                surface: theme.surfaceBackground,
                onSurface: theme.secondaryText,
              }
            }}
          />

          <TextInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            mode="flat"
            multiline
            numberOfLines={3}
            placeholder="Tell us about yourself..."
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
              }
            }}
          />

          <TextInput
            label="Location"
            value={location}
            onChangeText={setLocation}
            mode="flat"
            placeholder="City, Country"
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
              }
            }}
          />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.cancelButton}
              disabled={isLoading}
              buttonColor={theme.secondaryButton}
              textColor={theme.secondaryButtonText}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSave}
              loading={isLoading}
              disabled={isLoading}
              style={styles.saveButton}
              buttonColor={theme.primaryButton}
              textColor={theme.primaryButtonText}
            >
              Save Changes
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 16,
  },
  card: {
    marginTop: 16,
    borderWidth: 1,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  profileImage: {
  },
  cameraButton: {
    position: "absolute",
    bottom: -5,
    right: -5,
  },
  input: {
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});