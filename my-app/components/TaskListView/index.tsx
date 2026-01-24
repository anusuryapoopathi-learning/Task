import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Task, TaskStatus, TaskPriority } from '@/components/TaskCard';

export interface TaskListViewProps {
  task: Task;
  onPress?: () => void;
  containerStyle?: ViewStyle;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  task,
  onPress,
  containerStyle,
}) => {
  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'Low':
        return '#10B981'; // Green
      case 'Medium':
        return '#F59E0B'; // Orange
      case 'High':
        return '#EF4444'; // Red
      default:
        return '#6B7280';
    }
  };

  const getPriorityColorLight = (priority: TaskPriority): string => {
    switch (priority) {
      case 'Low':
        return '#D1FAE5'; // Light green
      case 'Medium':
        return '#FEF3C7'; // Light orange/yellow
      case 'High':
        return '#FEE2E2'; // Light red
      default:
        return '#F3F4F6';
    }
  };

  const formatDate = (date?: Date | string): string => {
    if (!date) return '';
    
    // Handle both Date objects and date strings
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const ListContent = (
    <View style={[styles.listItem, containerStyle]}>
      <View style={[styles.dot, { backgroundColor: getPriorityColor(task.priority) }]} />
      
      <View style={styles.content}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        {task.dueDate && (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color="#6B7280" />
            <Text style={styles.dateText}>{formatDate(task.dueDate)}</Text>
          </View>
        )}
      </View>

      <View
        style={[
          styles.priorityBadge,
          { backgroundColor: getPriorityColorLight(task.priority) },
        ]}
      >
        <Text
          style={[
            styles.priorityText,
            { color: getPriorityColor(task.priority) },
          ]}
        >
          {task.priority}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {ListContent}
      </TouchableOpacity>
    );
  }

  return ListContent;
};

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  content: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
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
});
