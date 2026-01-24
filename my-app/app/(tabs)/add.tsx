import { useCreateTask } from '@/api/tasks';
import { CustomButton } from '@/components/CustomButton';
import { CustomDatePicker } from '@/components/CustomDatePicker';
import { SimpleDropdown } from '@/components/CustomDropDrown/SimpleDropdown';
import { CustomInput } from '@/components/CustomInput';
import { CustomPriorityStatus } from '@/components/CustomPriorityStatus';
import { createTaskSchema } from '@/zod/TastCreateZod/createTask';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

export default function CreateTaskScreen() {
  const insets = useSafeAreaInsets();
  const createTaskMutation = useCreateTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | number>('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Created date is set automatically
  const createdDate = new Date();

  const categoryOptions = [
    { label: 'Work', value: 'work' },
    { label: 'Personal', value: 'personal' },
    { label: 'Interview Preparation', value: 'interview' },
    { label: 'Health & Fitness', value: 'health' },
    { label: 'Learning', value: 'learning' },
  ];

  const priorityOptions = [
    { label: 'Low', value: 'Low', color: '#10B981' }, // Green
    { label: 'Medium', value: 'Medium', color: '#F59E0B' }, // Orange
    { label: 'High', value: 'High', color: '#EF4444' }, // Red
  ];

  const statusOptions = [
    { label: 'Pending', value: 'Pending', color: '#6B7280' },
    { label: 'In Progress', value: 'In Progress', color: '#3B82F6' },
    { label: 'Completed', value: 'Completed', color: '#10B981' },
  ];

  const handleCancel = () => {
    router.replace('/(tabs)');
  };

  const handleCreateTask = () => {
    // Reset errors
    setErrors({});

    try {
      // Validate with Zod
      const validated = createTaskSchema.parse({
        title,
        description,
        category: String(category),
        priority: priority as 'Low' | 'Medium' | 'High',
        status: status as 'Pending' | 'In Progress' | 'Completed',
        dueDate: dueDate || new Date(),
        createdDate,
      });

      // Map category value to display name
      const categoryMap: Record<string, string> = {
        'work': 'Work',
        'personal': 'Personal',
        'interview': 'Interview Preparation',
        'health': 'Health & Fitness',
        'learning': 'Learning',
      };

      // Create task via API
      createTaskMutation.mutate({
        title: validated.title,
        description: validated.description,
        category: categoryMap[validated.category] || validated.category,
        priority: validated.priority,
        status: validated.status,
        dueDate: validated.dueDate || new Date(),
        createdDate: validated.createdDate || new Date(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as string;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Task</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Form Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Task Title */}
        <CustomInput
          label="Task Title"
          placeholder="Enter task title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (errors.title) {
              setErrors({ ...errors, title: '' });
            }
          }}
          error={errors.title}
          containerStyle={styles.inputContainer}
        />

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[
              styles.textArea,
              errors.description && styles.inputError,
            ]}
            placeholder="Add notes or details"
            placeholderTextColor="#999"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) {
                setErrors({ ...errors, description: '' });
              }
            }}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        {/* Category */}
        <SimpleDropdown
          label="Category"
          placeholder="Select category"
          options={categoryOptions}
          value={category}
          onSelect={(option) => {
            setCategory(option.value);
            if (errors.category) {
              setErrors({ ...errors, category: '' });
            }
          }}
          error={errors.category}
          containerStyle={styles.inputContainer}
        />

        {/* Priority */}
        <CustomPriorityStatus
          label="Priority"
          options={priorityOptions}
          value={priority}
          onValueChange={(value) => {
            setPriority(value);
            if (errors.priority) {
              setErrors({ ...errors, priority: '' });
            }
          }}
          error={errors.priority}
          containerStyle={styles.inputContainer}
        />

        {/* Status */}
        <CustomPriorityStatus
          label="Status"
          options={statusOptions}
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            if (errors.status) {
              setErrors({ ...errors, status: '' });
            }
          }}
          error={errors.status}
          containerStyle={styles.inputContainer}
        />

        {/* Due Date */}
        <CustomDatePicker
          label="Due Date"
          placeholder="Select due date"
          value={dueDate}
          onDateChange={(date) => {
            setDueDate(date);
            if (errors.dueDate) {
              setErrors({ ...errors, dueDate: '' });
            }
          }}
          mode="date"
          error={errors.dueDate}
          containerStyle={styles.inputContainer}
        />

        {/* Created Date (Read-only) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Created Date</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>
              {createdDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            size="large"
            containerStyle={styles.cancelButton}
          />
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Create Task"
            onPress={handleCreateTask}
            variant="gradient"
            size="large"
            containerStyle={styles.createButton}
            loading={createTaskMutation.isPending}
            disabled={createTaskMutation.isPending}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for footer buttons
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    color: '#333',
    minHeight: 120,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  readOnlyInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#6B7280',
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
  cancelButton: {
    width: '100%',
  },
  createButton: {
    width: '100%',
  },
});
