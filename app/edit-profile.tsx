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

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
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
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
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
              style={styles.cameraButton}
            />
          </View>

          {/* Form Fields */}
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            disabled // Usually email can't be changed
          />

          <TextInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Tell us about yourself..."
            style={styles.input}
          />

          <TextInput
            label="Location"
            value={location}
            onChangeText={setLocation}
            mode="outlined"
            placeholder="City, Country"
            style={styles.input}
          />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSave}
              loading={isLoading}
              disabled={isLoading}
              style={styles.saveButton}
            >
              Save Changes
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  card: {
    marginTop: 16,
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
    backgroundColor: "#7c4dff",
  },
  cameraButton: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#7c4dff",
  },
  input: {
    marginBottom: 16,
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