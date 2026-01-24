import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | string; // Can be Date or string (from cache/API)
  category?: string;
  createdDate?: Date | string; // Can be Date or string (from cache/API)
  _isPending?: boolean; // Indicates task is queued for sync
}

export interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  containerStyle?: ViewStyle;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  containerStyle,
}) => {
  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'In Progress':
        return '#F3E8FF'; // Light purple
      case 'Pending':
        return '#FEF3C7'; // Light orange/yellow
      case 'Completed':
        return '#D1FAE5'; // Light green
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
        return '#D1FAE5'; // Light green
      case 'Medium':
        return '#FEF3C7'; // Light orange/yellow
      case 'High':
        return '#FEE2E2'; // Light red
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


  const CardContent = (
    <View style={[styles.card, containerStyle]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          {task._isPending && (
            <View style={styles.pendingBadge}>
              <Ionicons name="time-outline" size={12} color="#F59E0B" />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>
        <View
          style={[
            styles.priorityBadgeTop,
            { backgroundColor: getPriorityColor(task.priority) },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: getPriorityTextColor(task.priority) },
            ]}
          >
            {task.priority}
          </Text>
        </View>
      </View>
      
      {task.description && (
        <Text 
          style={styles.taskDescription} 
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {task.description}
        </Text>
      )}
      
      <View style={styles.cardFooter}>
        <View
          style={[
            styles.badge,
            { backgroundColor: getStatusColor(task.status) },
          ]}
        >
          <Text
            style={[styles.badgeText, { color: getStatusTextColor(task.status) }]}
          >
            {task.status}
          </Text>
        </View>

        {task.dueDate && (
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>{formatDate(task.dueDate)}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
  },
  priorityBadgeTop: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
