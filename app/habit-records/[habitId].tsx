import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { 
  Card, 
  Text, 
  Avatar, 
  Chip,
  ActivityIndicator 
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { databases, DATABASE_ID, COMPLETIONS_COLLECTION_ID, HABITS_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';
import { Habit, HabitCompletion, UserRecord } from '@/types/database.type';

export default function HabitRecordsScreen() {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  
  const [habit, setHabit] = useState<Habit | null>(null);
  const [userRecords, setUserRecords] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (habitId) {
      fetchHabitRecords();
    }
  }, [habitId, timeFilter]);

  const fetchHabitRecords = async () => {
    try {
      setLoading(true);
      
      // Fetch habit details
      const habitResponse = await databases.getDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        habitId!
      );
      setHabit(habitResponse as Habit);

      // Calculate date filter
      const now = new Date();
      let startDate = new Date();
      
      switch (timeFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'all':
          startDate = new Date('2020-01-01'); // Far back date
          break;
      }

      // Fetch all completions for this habit within time filter
      const completionsResponse = await databases.listDocuments(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [
          Query.equal('habit_id', habitId!),
          Query.greaterThanEqual('completed_at', startDate.toISOString()),
          Query.orderDesc('completed_at'),
          Query.limit(1000) // Adjust as needed
        ]
      );

      const completions = completionsResponse.documents as HabitCompletion[];
      
      // Group completions by user and calculate stats
      const userRecordsMap = new Map<string, UserRecord>();
      
      for (const completion of completions) {
        if (!userRecordsMap.has(completion.user_id)) {
          // For demo purposes, we'll create a simple user name
          // In production, you'd fetch actual user details
          const userName = completion.user_id === user?.$id 
            ? (user?.name || 'You') 
            : `User ${completion.user_id.slice(-4)}`;
          
          userRecordsMap.set(completion.user_id, {
            user_id: completion.user_id,
            user_name: userName,
            completions: [],
            totalCount: 0,
            rank: 0
          });
        }
        
        const userRecord = userRecordsMap.get(completion.user_id)!;
        userRecord.completions.push(completion);
        userRecord.totalCount++;
      }

      // Calculate averages and rankings
      const records = Array.from(userRecordsMap.values()).map(record => {
        const values = record.completions
          .map(c => parseFloat(c.value || '0'))
          .filter(v => !isNaN(v));
        
        record.averageValue = values.length > 0 
          ? values.reduce((a, b) => a + b, 0) / values.length 
          : 0;
        
        record.lastCompletion = record.completions[0]; // Most recent (already sorted)
        
        return record;
      });

      // Sort by total count (or average value for numeric habits)
      records.sort((a, b) => {
        if (habitResponse.unit_type === 'number') {
          return (b.averageValue || 0) - (a.averageValue || 0);
        }
        return b.totalCount - a.totalCount;
      });

      // Assign ranks
      records.forEach((record, index) => {
        record.rank = index + 1;
      });

      setUserRecords(records);
    } catch (error) {
      console.error('Error fetching habit records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (completion: HabitCompletion) => {
    return completion.display_value || completion.value || '-';
  };

  const getCurrentUserRank = () => {
    const currentUserRecord = userRecords.find(r => r.user_id === user?.$id);
    return currentUserRecord?.rank || 'N/A';
  };

  const renderUserRecord = ({ item }: { item: UserRecord }) => {
    const isCurrentUser = item.user_id === user?.$id;
    
    return (
      <Card style={[styles.recordCard, isCurrentUser && styles.currentUserCard]}>
        <Card.Content style={styles.recordContent}>
          <View style={styles.userInfo}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{item.rank}</Text>
            </View>
            <Avatar.Text 
              size={40} 
              label={item.user_name.charAt(0).toUpperCase()}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text variant="titleMedium" style={styles.userName}>
                {item.user_name} {isCurrentUser && '(You)'}
              </Text>
              <Text variant="bodySmall" style={styles.userStats}>
                {item.totalCount} completions
              </Text>
            </View>
          </View>
          
          <View style={styles.recordStats}>
            {habit?.unit_type === 'number' && (
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>Average</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {item.averageValue?.toFixed(1) || '0'} {habit.unit_label}
                </Text>
              </View>
            )}
            
            {item.lastCompletion && (
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>Last</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {formatValue(item.lastCompletion)}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading records...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.habitTitle}>
            {habit?.title}
          </Text>
          <Text variant="bodyMedium" style={styles.habitDescription}>
            {habit?.description}
          </Text>
          <Text variant="bodySmall" style={styles.sharedInfo}>
            🌟 Shared with {userRecords.length} participants
          </Text>
          
          <View style={styles.filterContainer}>
            {(['today', 'week', 'month', 'all'] as const).map((filter) => (
              <Chip
                key={filter}
                selected={timeFilter === filter}
                onPress={() => setTimeFilter(filter)}
                style={styles.filterChip}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Chip>
            ))}
          </View>
          
          <View style={styles.yourRankContainer}>
            <Text variant="titleMedium" style={styles.yourRankText}>
              Your Rank: #{getCurrentUserRank()}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <FlatList
        data={userRecords}
        renderItem={renderUserRecord}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  habitTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  habitDescription: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    minWidth: 60,
  },
  yourRankContainer: {
    alignItems: 'center',
  },
  yourRankText: {
    fontWeight: 'bold',
    color: '#7c4dff',
  },
  sharedInfo: {
    textAlign: 'center',
    color: '#7c4dff',
    marginBottom: 12,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  recordCard: {
    marginBottom: 12,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#7c4dff',
  },
  recordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    backgroundColor: '#7c4dff',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  avatar: {
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
  },
  userStats: {
    color: '#666',
  },
  recordStats: {
    alignItems: 'flex-end',
  },
  statItem: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
  },
  statValue: {
    fontWeight: 'bold',
  },
});