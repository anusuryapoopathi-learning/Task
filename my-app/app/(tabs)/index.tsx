import { useAuth } from '@/api/auth';
import { useTasks } from '@/api/tasks';
import { ProfileBottomSheet } from '@/components/ProfileBottomSheet';
import { TaskCard, type Task } from '@/components/TaskCard';
import { capitalizeUsername, getUsernameFromEmail } from '@/utils/username';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './styles';

type IconName = keyof typeof Ionicons.glyphMap;

interface DashboardSection {
  type: 'section';
  title: string;
  icon: IconName;
  color: string;
  tasks: Task[];
  key: string;
}

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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : (
        <FlatList<DashboardSection>
          data={[
            { type: 'section', title: "Today's Tasks", icon: 'sunny-outline', color: '#F59E0B', tasks: todayTasks, key: 'today' },
            { type: 'section', title: 'Recently Added', icon: 'time-outline', color: '#3B82F6', tasks: recentlyAddedTasks, key: 'recent' },
            { type: 'section', title: 'Pending Tasks', icon: 'hourglass-outline', color: '#6B7280', tasks: pendingTasks, key: 'pending' },
          ]}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name={item.icon} size={20} color={item.color} />
                <Text style={styles.sectionTitle}>{item.title}</Text>
              </View>
              {item.tasks.length === 0 ? (
                <Text style={styles.emptyText}>
                  {item.key === 'today' && 'No tasks due today'}
                  {item.key === 'recent' && 'No recent tasks'}
                  {item.key === 'pending' && 'No pending tasks'}
                </Text>
              ) : (
                item.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={() => {
                      router.push({
                        pathname: '/(tabs)/taskDetails/task-details',
                        params: { taskId: task.id },
                      });
                    }}
                  />
                ))
              )}
            </View>
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Profile Bottom Sheet */}
      <ProfileBottomSheet
        visible={profileSheetVisible}
        onClose={() => setProfileSheetVisible(false)}
      />
    </View>
  );
}
