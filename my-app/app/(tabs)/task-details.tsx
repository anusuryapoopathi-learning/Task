import { useMarkTaskComplete, useTask } from '@/api/tasks';
import { CustomButton } from '@/components/CustomButton';
import { CustomToaster } from '@/components/CustomToaster';
import { DetailCard } from '@/components/DetailCard';
import type { TaskPriority, TaskStatus } from '@/components/TaskCard';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TaskDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ taskId: string }>();
  const { data: task, isLoading } = useTask(params.taskId || '');
  const markCompleteMutation = useMarkTaskComplete();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle mutation success/error for toast notifications
  // MUST be before any conditional returns to follow Rules of Hooks
  useEffect(() => {
    if (markCompleteMutation.isSuccess && markCompleteMutation.data) {
      setToastMessage('Task marked as completed!');
    }
  }, [markCompleteMutation.isSuccess, markCompleteMutation.data]);

  useEffect(() => {
    if (markCompleteMutation.isError) {
      setToastMessage(markCompleteMutation.error?.message || 'Failed to mark task as complete');
    }
  }, [markCompleteMutation.isError, markCompleteMutation.error]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.errorText}>Loading task...</Text>
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'In Progress':
        return '#F3E8FF';
      case 'Pending':
        return '#FEF3C7';
      case 'Completed':
        return '#D1FAE5';
      default:
        return '#F3F4F6';
    }
  };

  const getStatusTextColor = (status: TaskStatus): string => {
    switch (status) {
      case 'In Progress':
        return '#8B5CF6';
      case 'Pending':
        return '#F59E0B';
      case 'Completed':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'Low':
        return '#D1FAE5';
      case 'Medium':
        return '#FEF3C7';
      case 'High':
        return '#FEE2E2';
      default:
        return '#F3F4F6';
    }
  };

  const getPriorityTextColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'Low':
        return '#10B981';
      case 'Medium':
        return '#F59E0B';
      case 'High':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (date?: Date | string): string => {
    if (!date) return 'Not set';
    
    // Handle both Date objects and date strings
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return 'Not set';
    
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleEditTask = () => {
    router.push({
      pathname: '/(tabs)/edit-task',
      params: { taskId: task.id },
    });
  };

  const handleMarkComplete = () => {
    if (task?.id) {
      markCompleteMutation.mutate(task.id);
    }
  };

  // Created date - use task's createdDate or fallback
  const createdDate = task.createdDate
    ? new Date(task.createdDate)
    : task.dueDate
    ? new Date((task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate)).getTime() - 24 * 60 * 60 * 1000)
    : new Date();

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <FlatList
        data={[
          { type: 'title', key: 'title' },
          { type: 'status', key: 'status' },
          { type: 'description', key: 'description' },
          { type: 'details', key: 'details' },
        ]}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'title':
              return (
                <View style={styles.titleSection}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(task.priority) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getPriorityTextColor(task.priority) },
                      ]}
                    >
                      {task.priority}
                    </Text>
                  </View>
                </View>
              );
            case 'status':
              return (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(task.status) },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusTextColor(task.status) },
                    ]}
                  >
                    {task.status}
                  </Text>
                </View>
              );
            case 'description':
              return (
                <View style={styles.descriptionCard}>
                  <Text style={styles.descriptionLabel}>Description</Text>
                  <Text style={styles.descriptionText}>
                    {task.description || 'No description provided'}
                  </Text>
                </View>
              );
            case 'details':
              return (
                <View style={styles.detailsGrid}>
                  <View style={styles.gridRow}>
                    <View style={styles.gridItem}>
                      <DetailCard
                        icon="pricetag-outline"
                        label="Category"
                        value={task.category || 'Not set'}
                      />
                    </View>
                    <View style={styles.gridItem}>
                      <DetailCard
                        icon="flag-outline"
                        label="Priority"
                        value={task.priority}
                      />
                    </View>
                  </View>
                  <View style={styles.gridRow}>
                    <View style={styles.gridItem}>
                      <DetailCard
                        icon="calendar-outline"
                        label="Due Date"
                        value={formatDate(task.dueDate)}
                      />
                    </View>
                    <View style={styles.gridItem}>
                      <DetailCard
                        icon="time-outline"
                        label="Created"
                        value={formatDate(createdDate)}
                      />
                    </View>
                  </View>
                </View>
              );
            default:
              return null;
          }
        }}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Sticky Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        {task.status !== 'Completed' && (
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Edit Task"
              onPress={handleEditTask}
              variant="outline"
              size="large"
              leftIcon={<Ionicons name="pencil-outline" size={20} color="#6B7280" />}
              containerStyle={styles.editButton}
            />
          </View>
        )}
        <View style={[styles.buttonContainer, task.status === 'Completed' && styles.fullWidthButton]}>
          <CustomButton
            title="Mark Complete"
            onPress={handleMarkComplete}
            variant="gradient"
            size="large"
            leftIcon={<Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
            containerStyle={styles.completeButton}
            loading={markCompleteMutation.isPending}
            disabled={markCompleteMutation.isPending || task.status === 'Completed'}
          />
        </View>
      </View>

      {/* Toast Notification */}
      <CustomToaster
        visible={toastMessage !== null}
        message={toastMessage || ''}
        type={markCompleteMutation.isError ? 'error' : 'success'}
        onHide={() => setToastMessage(null)}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for footer
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  detailsGrid: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
  editButton: {
    width: '100%',
  },
  completeButton: {
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
