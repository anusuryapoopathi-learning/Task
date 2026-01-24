import { useMarkTaskComplete, useTask } from '@/api/tasks';
import { CustomButton } from '@/components/CustomButton';
import { CustomToaster } from '@/components/CustomToaster';
import { DetailCard } from '@/components/DetailCard';
import type { TaskPriority, TaskStatus } from '@/components/TaskCard';
import { TASK_DETAIL_SECTIONS, type TaskDetailSection } from '@/constants/taskDetailFields';
import { formatDateToUS } from '@/utils/dateFormatter';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './styles';

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

  // Created date - use task's createdDate or fallback
  const createdDate = useMemo(() => {
    if (!task) return new Date();
    return task.createdDate
      ? new Date(task.createdDate)
      : task.dueDate
      ? new Date((task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate)).getTime() - 24 * 60 * 60 * 1000)
      : new Date();
  }, [task]);

  // Helper functions - defined as regular functions (not hooks) so they can be used conditionally
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

  // All hooks MUST be called before any conditional returns
  const formatDate = useCallback((date?: Date | string): string => {
    return formatDateToUS(date);
  }, []);

  const handleEditTask = useCallback(() => {
    if (!task?.id) return;
    router.push({
      pathname: '/(tabs)/editTask/edit-task',
      params: { taskId: task.id },
    });
  }, [task?.id]);

  const handleMarkComplete = useCallback(() => {
    if (task?.id) {
      markCompleteMutation.mutate(task.id);
    }
  }, [task?.id, markCompleteMutation]);

  // Render detail section based on type
  const renderDetailSection = useCallback((item: TaskDetailSection) => {
    if (!task) return null;

    const currentTask = task; // Type narrowing for TypeScript

    switch (item.type) {
      case 'title':
        return (
          <View style={styles.titleSection}>
            <Text style={styles.taskTitle}>{currentTask.title}</Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(currentTask.priority) },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  { color: getPriorityTextColor(currentTask.priority) },
                ]}
              >
                {currentTask.priority}
              </Text>
            </View>
          </View>
        );
      case 'status':
        return (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(currentTask.status) },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusTextColor(currentTask.status) },
              ]}
            >
              {currentTask.status}
            </Text>
          </View>
        );
      case 'description':
        return (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.descriptionText}>
              {currentTask.description || 'No description provided'}
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
                  value={currentTask.category || 'Not set'}
                />
              </View>
              <View style={styles.gridItem}>
                <DetailCard
                  icon="flag-outline"
                  label="Priority"
                  value={currentTask.priority}
                />
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <DetailCard
                  icon="calendar-outline"
                  label="Due Date"
                  value={formatDate(currentTask.dueDate)}
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
  }, [task, formatDate, createdDate, getPriorityColor, getPriorityTextColor, getStatusColor, getStatusTextColor]);

  // TypeScript type guard: after early returns, task is guaranteed to be non-null
  // This must be after all hooks but before the return statement
  if (!task) {
    return null; // This should never happen due to early return above, but TypeScript needs it
  }

  const currentTask = task;

  return (
    <View style={styles.container}>
      {/* Sticky Header - Always visible, even during loading */}
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
        data={TASK_DETAIL_SECTIONS}
        renderItem={({ item }) => renderDetailSection(item)}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Sticky Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        {currentTask.status !== 'Completed' && (
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
        <View style={[styles.buttonContainer, currentTask.status === 'Completed' && styles.fullWidthButton]}>
          <CustomButton
            title="Mark Complete"
            onPress={handleMarkComplete}
            variant="gradient"
            size="large"
            leftIcon={<Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
            containerStyle={styles.completeButton}
            loading={markCompleteMutation.isPending}
            disabled={markCompleteMutation.isPending || currentTask.status === 'Completed'}
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
