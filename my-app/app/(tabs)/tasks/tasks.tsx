import { useAuth } from '@/api/auth';
import { useTasks } from '@/api/tasks';
import { ProfileBottomSheet } from '@/components/ProfileBottomSheet';
import { TaskCard } from '@/components/TaskCard';
import { TaskListView } from '@/components/TaskListView';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './styles';

type ViewMode = 'cards' | 'list';

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { data: user } = useAuth();
  const { data: allTasks = [], isLoading } = useTasks();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileSheetVisible, setProfileSheetVisible] = useState(false);

  // Filter and sort tasks - newest first
  const filteredTasks = useMemo(() => {
    let tasks = [...allTasks];
    
    // Sort by createdDate (newest first)
    tasks.sort((a, b) => {
      const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
      const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
    
    // Filter by search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }
    
    return tasks;
  }, [allTasks, searchQuery]);

  const handleSearchToggle = () => {
    setIsSearchActive(true);
    setSearchQuery('');
  };

  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {!isSearchActive ? (
          <>
            <Text style={styles.headerTitle}>All Tasks</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleSearchToggle}
              >
                <Ionicons name="search-outline" size={24} color="#1F2937" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setProfileSheetVisible(true)}
              >
                <View style={styles.profileIcon}>
                  <Ionicons name="person-outline" size={20} color="#8B5CF6" />
                </View>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tasks..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity onPress={handleSearchClose} style={styles.closeIcon}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* View Toggle */}
      {!isSearchActive && (
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'cards' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('cards')}
          >
            <Ionicons
              name="grid-outline"
              size={20}
              color={viewMode === 'cards' ? '#1F2937' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === 'cards' && styles.toggleTextActive,
              ]}
            >
              Cards
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'list' && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list-outline"
              size={20}
              color={viewMode === 'list' ? '#1F2937' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === 'list' && styles.toggleTextActive,
              ]}
            >
              List
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scrollable Content */}
      {isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading tasks...</Text>
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No tasks found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery.trim() ? 'Try adjusting your search query' : 'No tasks available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item: task }) =>
            viewMode === 'cards' ? (
              <TaskCard
                task={task}
                onPress={() => {
                  router.push({
                    pathname: '/(tabs)/taskDetails/task-details',
                    params: { taskId: task.id },
                  });
                }}
              />
            ) : (
              <TaskListView
                task={task}
                onPress={() => {
                  router.push({
                    pathname: '/(tabs)/taskDetails/task-details',
                    params: { taskId: task.id },
                  });
                }}
              />
            )
          }
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
