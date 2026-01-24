import { useAuth } from '@/api/auth';
import { useTasks } from '@/api/tasks';
import { ProfileBottomSheet } from '@/components/ProfileBottomSheet';
import { TaskCard } from '@/components/TaskCard';
import { capitalizeUsername, getUsernameFromEmail } from '@/utils/username';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { data: user } = useAuth();
  const { data: allTasks = [], isLoading } = useTasks();
  const [profileSheetVisible, setProfileSheetVisible] = useState(false);

  const username = user?.email ? capitalizeUsername(getUsernameFromEmail(user.email)) : 'User';
  const displayName = user?.name || username;

  // Filter tasks
  const { todayTasks, recentlyAddedTasks, pendingTasks } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's Tasks: due date is today
    const todayTasksList = allTasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });

    // Recently Added: sort by createdDate (most recent first)
    const recentlyAddedList = [...allTasks]
      .filter((task) => task.createdDate)
      .sort((a, b) => {
        const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return dateB - dateA; // Most recent first
      })
      .slice(0, 10); // Show last 10 recently added

    // Pending Tasks: due date exceeded AND status not completed
    const pendingTasksList = allTasks.filter((task) => {
      if (!task.dueDate) return false;
      if (task.status === 'Completed') return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() < today.getTime();
    });

    return {
      todayTasks: todayTasksList,
      recentlyAddedTasks: recentlyAddedList,
      pendingTasks: pendingTasksList,
    };
  }, [allTasks]);

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            {getGreeting()} <Text style={styles.emoji}>👋</Text>
          </Text>
          <Text style={styles.userName}>{displayName}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setProfileSheetVisible(true)}
        >
          <View style={styles.profileIcon}>
            <Ionicons name="person-outline" size={24} color="#8B5CF6" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        ) : (
          <>
            {/* Today's Tasks Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sunny-outline" size={20} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Today's Tasks</Text>
              </View>
              {todayTasks.length === 0 ? (
                <Text style={styles.emptyText}>No tasks due today</Text>
              ) : (
                todayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={() => {
                      router.push({
                        pathname: '/(tabs)/task-details',
                        params: { taskId: task.id },
                      });
                    }}
                  />
                ))
              )}
            </View>

            {/* Recently Added Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={20} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Recently Added</Text>
              </View>
              {recentlyAddedTasks.length === 0 ? (
                <Text style={styles.emptyText}>No recent tasks</Text>
              ) : (
                recentlyAddedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={() => {
                      router.push({
                        pathname: '/(tabs)/task-details',
                        params: { taskId: task.id },
                      });
                    }}
                  />
                ))
              )}
            </View>

            {/* Pending Tasks Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="hourglass-outline" size={20} color="#6B7280" />
                <Text style={styles.sectionTitle}>Pending Tasks</Text>
              </View>
              {pendingTasks.length === 0 ? (
                <Text style={styles.emptyText}>No pending tasks</Text>
              ) : (
                pendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={() => {
                      router.push({
                        pathname: '/(tabs)/task-details',
                        params: { taskId: task.id },
                      });
                    }}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Profile Bottom Sheet */}
      <ProfileBottomSheet
        visible={profileSheetVisible}
        onClose={() => setProfileSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  emoji: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileButton: {
    padding: 4,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
