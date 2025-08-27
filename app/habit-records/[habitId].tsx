import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { 
  Card, 
  Text, 
  Avatar, 
  Chip,
  ActivityIndicator,
  Modal,
  Portal,
  Button,
  IconButton
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { databases, DATABASE_ID, COMPLETIONS_COLLECTION_ID, HABITS_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';
import { Habit, HabitCompletion } from '@/types/database.type';
import { GradientBackground } from '../components/GradientBackground';
import { useTimeBasedTheme } from '../hooks/useTimeBasedTheme';

interface TableData {
  dates: string[];
  users: {
    user_id: string;
    user_name: string;
    completions: { [date: string]: HabitCompletion | null };
    todayCompletionTime?: string;
  }[];
}

export default function HabitRecordsScreen() {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTimeBasedTheme();
  
  const [habit, setHabit] = useState<Habit | null>(null);
  const [tableData, setTableData] = useState<TableData>({ dates: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [selectedUser, setSelectedUser] = useState<TableData['users'][0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (habitId) {
      fetchHabitRecords();
    }
  }, [habitId, timeFilter]);

  // Auto-scroll to show today's column (leftmost after reverse)
  useEffect(() => {
    if (tableData.dates.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, animated: false });
      }, 100);
    }
  }, [tableData.dates.length]);

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

      // Generate date range based on filter
      const today = new Date();
      const todayString = getTodayString();
      let startDate = new Date();
      
      switch (timeFilter) {
        case 'today':
          startDate = today;
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'all':
          startDate.setFullYear(today.getFullYear() - 1);
          break;
      }

      // Generate dates from start to today
      const dates: string[] = [];
      const current = new Date(startDate);
      while (current <= today) {
        dates.push(getDateString(current));
        current.setDate(current.getDate() + 1);
      }

      // Fetch ALL completions for this habit (no date filtering in query)
      const completionsResponse = await databases.listDocuments(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [
          Query.equal('habit_id', habitId!),
          Query.orderDesc('completed_at'),
          Query.limit(1000)
        ]
      );

      const completions = completionsResponse.documents as HabitCompletion[];
      
      // Group completions by user
      const userMap = new Map<string, {
        user_name: string;
        completions: { [date: string]: HabitCompletion };
        todayCompletionTime?: string;
      }>();
      
      completions.forEach(completion => {
        const completionDate = utcToLocalDate(completion.completed_at);
        if (!dates.includes(completionDate)) return;
        
        if (!userMap.has(completion.user_id)) {
          const userName = completion.user_id === user?.$id 
            ? (user?.name || 'You') 
            : `User ${completion.user_id.slice(-4)}`;
          
          userMap.set(completion.user_id, {
            user_name: userName,
            completions: {},
          });
        }
        
        const userRecord = userMap.get(completion.user_id)!;
        userRecord.completions[completionDate] = completion;
        
        if (completionDate === todayString) {
          userRecord.todayCompletionTime = completion.completed_at;
        }
      });

      // Convert to array and sort by today's completion
      const users = Array.from(userMap.entries())
        .map(([user_id, user]) => ({ ...user, user_id }))
        .sort((a, b) => {
          if (a.todayCompletionTime && b.todayCompletionTime) {
            return a.todayCompletionTime.localeCompare(b.todayCompletionTime);
          }
          return (b.todayCompletionTime ? 1 : 0) - (a.todayCompletionTime ? 1 : 0);
        });

      // Reverse dates to show most recent first
      const finalDates = dates.reverse();
      setTableData({ dates: finalDates, users });
      
    } catch (error) {
      console.error('Error fetching habit records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (completion: HabitCompletion | null) => {
    if (!completion) return '';
    return completion.display_value || completion.value || '✓';
  };

  const formatDate = (dateStr: string) => {
    // IMPORTANT: dateStr is in YYYY-MM-DD format, not a timestamp
    // Don't use new Date() which can cause timezone issues
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}`;
  };

  // Simple date utilities
  const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTodayString = () => getDateString(new Date());

  const utcToLocalDate = (utcTimestamp: string) => getDateString(new Date(utcTimestamp));

  const handleUserPress = (userData: TableData['users'][0]) => {
    setSelectedUser(userData);
    setModalVisible(true);
  };

  const LineChart = ({ dates, userData, habit, formatValue, formatDate }: {
    dates: string[];
    userData: TableData['users'][0];
    habit: Habit | null;
    formatValue: (completion: HabitCompletion | null) => string;
    formatDate: (dateStr: string) => string;
  }) => {
    const chartWidth = Math.max(dates.length * 50, 300);
    const chartHeight = 120;
    const padding = { top: 20, right: 30, bottom: 40, left: 30 };
    const graphWidth = chartWidth - padding.left - padding.right;
    const graphHeight = chartHeight - padding.top - padding.bottom;

    // Prepare data points
    const dataPoints = dates.map((date, index) => {
      const completion = userData.completions[date];
      const value = completion ? 
        (habit?.unit_type === 'number' ? parseFloat(completion.value || '0') : 1) : 0;
      return { date, value, hasCompletion: !!completion, index };
    });

    // Calculate max value for scaling
    const allValues = tableData.users.flatMap(user => 
      Object.values(user.completions)
        .filter(c => c)
        .map(c => habit?.unit_type === 'number' ? parseFloat(c!.value || '0') : 1)
    );
    const maxValue = Math.max(...allValues, 1);

    // Generate SVG path for the line
    let pathData = '';
    const validPoints = dataPoints.filter(point => point.hasCompletion);
    
    if (validPoints.length > 0) {
      validPoints.forEach((point, index) => {
        const x = padding.left + (point.index / (dates.length - 1)) * graphWidth;
        const y = padding.top + graphHeight - (point.value / maxValue) * graphHeight;
        
        if (index === 0) {
          pathData += `M ${x} ${y}`;
        } else {
          pathData += ` L ${x} ${y}`;
        }
      });
    }

    return (
      <View style={[styles.svgContainer, { width: chartWidth, height: chartHeight }]}>
        {/* Grid lines and axes would go here if using SVG */}
        <View style={styles.chartGrid}>
          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <View 
              key={index}
              style={[
                styles.gridLine, 
                { 
                  top: padding.top + graphHeight * ratio,
                  left: padding.left,
                  width: graphWidth 
                }
              ]} 
            />
          ))}
        </View>
        
        {/* Data points */}
        {dataPoints.map((point, index) => {
          const x = padding.left + (index / (dates.length - 1)) * graphWidth;
          const y = padding.top + graphHeight - (point.value / maxValue) * graphHeight;
          
          return (
            <View key={point.date}>
              {/* Point */}
              {point.hasCompletion && (
                <View
                  style={[
                    styles.dataPoint,
                    {
                      left: x - 4,
                      top: y - 4,
                    }
                  ]}
                />
              )}
              
              {/* Date label */}
              <Text
                style={[
                  styles.dateLabel,
                  {
                    left: x - 20,
                    top: chartHeight - 30,
                  }
                ]}
              >
                {formatDate(point.date)}
              </Text>
              
              {/* Value label */}
              {point.hasCompletion && (
                <Text
                  style={[
                    styles.valueLabel,
                    {
                      left: x - 15,
                      top: y - 20,
                    }
                  ]}
                >
                  {formatValue(userData.completions[point.date])}
                </Text>
              )}
            </View>
          );
        })}
        
        {/* Connect points with lines */}
        {validPoints.length > 1 && validPoints.slice(0, -1).map((point, index) => {
          const nextPoint = validPoints[index + 1];
          const x1 = padding.left + (point.index / (dates.length - 1)) * graphWidth;
          const y1 = padding.top + graphHeight - (point.value / maxValue) * graphHeight;
          const x2 = padding.left + (nextPoint.index / (dates.length - 1)) * graphWidth;
          const y2 = padding.top + graphHeight - (nextPoint.value / maxValue) * graphHeight;
          
          const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
          
          return (
            <View
              key={`line-${point.date}-${nextPoint.date}`}
              style={[
                styles.connectionLine,
                {
                  left: x1,
                  top: y1,
                  width: lineLength,
                  transform: [{ rotate: `${angle}deg` }],
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primaryButton} />
          <Text style={[styles.loadingText, { color: theme.primaryText }]}>Loading records...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
      <Card style={[styles.headerCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
        <Card.Content>
          <Text variant="headlineSmall" style={[styles.arenaTitle, { color: theme.primaryText }]}>
            {habit?.title}
          </Text>
          <Text variant="bodyMedium" style={[styles.arenaDescription, { color: theme.secondaryText }]}>
            {habit?.description}
          </Text>
          <Text variant="bodySmall" style={[styles.sharedInfo, { color: theme.accentColor }]}>
            🌟 Shared with {tableData.users.length} participants
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
        </Card.Content>
      </Card>

      <Card style={[styles.tableCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
        <Card.Content>
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
          >
            <View style={[styles.customTable, { minWidth: 150 + (tableData.dates.length * 80) }]}>
              {/* Custom Table Header */}
              <View style={[styles.customTableHeader, { backgroundColor: theme.primaryButton }]}>
                <View style={[styles.customHeaderCell, styles.userColumn]}>
                  <Text variant="titleSmall" style={[styles.headerText, { color: theme.primaryButtonText }]}>Member</Text>
                </View>
                {tableData.dates.map((date) => {
                  const isToday = date === getTodayString();
                  return (
                    <View key={`header-${date}`} style={[styles.customHeaderCell, styles.dateColumn, isToday && { backgroundColor: theme.accentColor }]}>
                      <Text variant="bodySmall" style={[styles.headerText, { color: theme.primaryText }, isToday && { color: theme.primaryButtonText }]}>
                        {formatDate(date)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Custom Table Rows */}
              {tableData.users.map((userData) => {
                const isCurrentUser = userData.user_id === user?.$id;
                return (
                  <View 
                    key={userData.user_id} 
                    style={[
                      styles.customTableRow, 
                      { backgroundColor: theme.surfaceBackground },
                      isCurrentUser && { backgroundColor: theme.accentColor }
                    ]}
                  >
                    <View style={[styles.customCell, styles.userColumn]}>
                      <View style={styles.userCell}>
                        <Avatar.Text 
                          size={24} 
                          label={userData.user_name.charAt(0).toUpperCase()}
                          style={[styles.smallAvatar, { backgroundColor: theme.primaryButton }]}
                          labelStyle={{ color: theme.primaryButtonText }}
                        />
                        <Text variant="bodyMedium" style={[styles.userNameText, { color: isCurrentUser ? theme.primaryButtonText : theme.primaryText }]}>
                          {userData.user_name}{isCurrentUser && ' (You)'}
                        </Text>
                      </View>
                    </View>
                    {tableData.dates.map((date) => {
                      const completion = userData.completions[date];
                      const isToday = date === getTodayString();
                      const hasCompletedToday = isToday && completion;
                      
                      return (
                        <View key={`${userData.user_id}-${date}`} style={[
                          styles.customCell, 
                          styles.dateColumn, 
                          isToday && { backgroundColor: theme.accentColor }
                        ]}>
                          <View style={styles.cellContainer}>
                            <Text variant="bodySmall" style={[
                              styles.cellValue, 
                              { color: isToday ? theme.primaryButtonText : theme.primaryText }
                            ]}>
                              {formatValue(completion) || '-'}
                            </Text>
                            {hasCompletedToday && (
                              <View style={[styles.todayDot, { backgroundColor: theme.successColor }]} />
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.primaryText }]}>
                  {selectedUser?.user_name}&apos;s Progress
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                  iconColor={theme.primaryText}
                />
              </View>
              
              {selectedUser && (
                <View style={styles.progressContainer}>
                  <Text variant="titleMedium" style={[styles.progressTitle, { color: theme.primaryText }]}>
                    Recent Activity
                  </Text>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.lineChartContainer}>
                      {selectedUser && (
                        <LineChart 
                          dates={tableData.dates.slice().reverse()}
                          userData={selectedUser}
                          habit={habit}
                          formatValue={formatValue}
                          formatDate={formatDate}
                        />
                      )}
                    </View>
                  </ScrollView>
                  
                  <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                      <Text variant="titleMedium">
                        {Object.keys(selectedUser.completions).length}
                      </Text>
                      <Text variant="bodySmall" style={styles.statLabel}>
                        Total Days
                      </Text>
                    </View>
                    
                    {habit?.unit_type === 'number' && (
                      <View style={styles.statBox}>
                        <Text variant="titleMedium">
                          {(Object.values(selectedUser.completions)
                            .filter(c => c)
                            .reduce((sum, c) => sum + parseFloat(c!.value || '0'), 0) / 
                            Object.keys(selectedUser.completions).length || 0
                          ).toFixed(1)}
                        </Text>
                        <Text variant="bodySmall" style={styles.statLabel}>
                          Average {habit.unit_label}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              
              <Button 
                mode="contained" 
                onPress={() => setModalVisible(false)} 
                style={styles.closeButton}
                buttonColor={theme.primaryButton}
                textColor={theme.primaryButtonText}
              >
                Close
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  arenaTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  arenaDescription: {
    textAlign: 'center',
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
  sharedInfo: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  tableCard: {
    margin: 16,
    marginTop: 8,
  },
  customTable: {
    borderRadius: 8,
  },
  customTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  customHeaderCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  customTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    minHeight: 50,
  },
  customCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  userColumn: {
    flex: 2,
    minWidth: 150,
  },
  dateColumn: {
    flex: 1,
    minWidth: 70, // Slightly wider to ensure visibility
    width: 70, // Fixed width for consistency
    justifyContent: 'center',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  currentUserRow: {
  },
  headerText: {
    fontWeight: 'bold',
  },
  todayColumn: {
  },
  todayHeaderText: {
    fontWeight: 'bold',
  },
  userCell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  smallAvatar: {
    marginRight: 8,
  },
  userNameText: {
    flex: 1,
    fontWeight: '500',
  },
  cellContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 40,
    paddingVertical: 8,
  },
  cellValue: {
    textAlign: 'center',
    fontWeight: '500',
  },
  todayDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  lineChartContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    minHeight: 180,
  },
  svgContainer: {
    position: 'relative',
    borderRadius: 8,
    margin: 10,
  },
  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: 'white',
  },
  connectionLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#4caf50',
    transformOrigin: '0 50%',
  },
  dateLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    width: 40,
  },
  valueLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#4caf50',
    fontWeight: 'bold',
    textAlign: 'center',
    width: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    marginTop: 16,
  },
});