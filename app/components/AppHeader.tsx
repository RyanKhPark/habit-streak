import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Avatar, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.notificationButton}>
        <MaterialCommunityIcons name="bell-outline" size={24} color="#333" />
        <Badge size={8} style={styles.notificationBadge} />
      </TouchableOpacity>
      
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      
      <TouchableOpacity 
        style={styles.userButton}
        onPress={() => router.push('/profile')}
      >
        <Avatar.Text 
          size={40} 
          label={user?.name?.charAt(0) || 'H'} 
          style={styles.userAvatar}
          labelStyle={styles.avatarLabel}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#ff4757",
  },
  title: {
    fontWeight: "600",
    color: "#2d2d2d",
    fontSize: 18,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  userButton: {
    padding: 4,
  },
  userAvatar: {
    backgroundColor: "#e8e8e8",
  },
  avatarLabel: {
    color: "#2d2d2d",
    fontWeight: "600",
    fontSize: 16,
  },
});