import { useCreateTask } from '@/api/tasks';
import { CustomButton } from '@/components/CustomButton';
import { CustomDatePicker } from '@/components/CustomDatePicker';
import { SimpleDropdown } from '@/components/CustomDropDrown/SimpleDropdown';
import { CustomInput } from '@/components/CustomInput';
import { CustomPriorityStatus } from '@/components/CustomPriorityStatus';
import { CustomToaster } from '@/components/CustomToaster';
import type { CreateTaskInput } from '@/zod/TastCreateZod/createTask';
import { createTaskSchema } from '@/zod/TastCreateZod/createTask';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Map category values to display names
const categoryMap: Record<string, string> = {
  'work': 'Work',
  'personal': 'Personal',
  'interview': 'Interview Preparation',
  'health': 'Health & Fitness',
  'learning': 'Learning',
};

const categoryOptions = [
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'personal' },
  { label: 'Interview Preparation', value: 'interview' },
  { label: 'Health & Fitness', value: 'health' },
  { label: 'Learning', value: 'learning' },
];

const priorityOptions = [
  { label: 'Low', value: 'Low', color: '#10B981' },
  { label: 'Medium', value: 'Medium', color: '#F59E0B' },
  { label: 'High', value: 'High', color: '#EF4444' },
];

const statusOptions = [
  { label: 'Pending', value: 'Pending', color: '#6B7280' },
  { label: 'In Progress', value: 'In Progress', color: '#3B82F6' },
  { label: 'Completed', value: 'Completed', color: '#10B981' },
];

export default function CreateTaskScreen() {
  const insets = useSafeAreaInsets();
  const createTaskMutation = useCreateTask();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'Low',
      status: 'Pending',
      dueDate: new Date(),
      createdDate: new Date(),
    },
  });

  // Clear form when screen is focused
  useFocusEffect(
    useCallback(() => {
      reset({
        title: '',
        description: '',
        category: '',
        priority: 'Low',
        status: 'Pending',
        dueDate: new Date(),
        createdDate: new Date(),
      });
    }, [reset])
  );

  // Handle mutation success/error for toast notifications
  useEffect(() => {
    if (createTaskMutation.isSuccess && createTaskMutation.data) {
      setToastMessage('Task created successfully!');
      reset(); // Auto-reset form after success
    }
  }, [createTaskMutation.isSuccess, createTaskMutation.data, reset]);

  useEffect(() => {
    if (createTaskMutation.isError) {
      setToastMessage(createTaskMutation.error?.message || 'Failed to create task');
    }
  }, [createTaskMutation.isError, createTaskMutation.error]);

  const onSubmit = (data: CreateTaskInput) => {
    createTaskMutation.mutate({
      title: data.title,
      description: data.description,
      category: categoryMap[data.category] || data.category,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      createdDate: data.createdDate || new Date(),
    });
  };

  const handleCancel = () => {
    router.replace('/(tabs)');
  };

  const createdDate = new Date();

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Task</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Form Content */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <FlatList
          data={[
            { type: 'title', key: 'title' },
            { type: 'description', key: 'description' },
            { type: 'category', key: 'category' },
            { type: 'priority', key: 'priority' },
            { type: 'status', key: 'status' },
            { type: 'dueDate', key: 'dueDate' },
            { type: 'createdDate', key: 'createdDate' },
          ]}
          renderItem={({ item }) => {
            switch (item.type) {
              case 'title':
                return (
                  <Controller
                    control={control}
                    name="title"
                    render={({ field: { onChange, value } }) => (
                      <CustomInput
                        label="Task Title"
                        placeholder="Enter task title"
                        value={value}
                        onChangeText={onChange}
                        error={errors.title?.message}
                        containerStyle={styles.inputContainer}
                      />
                    )}
                  />
                );
              case 'description':
                return (
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                          style={[styles.textArea, errors.description && styles.inputError]}
                          placeholder="Add notes or details"
                          placeholderTextColor="#999"
                          value={value}
                          onChangeText={onChange}
                          multiline
                          numberOfLines={6}
                          textAlignVertical="top"
                        />
                        {errors.description && (
                          <Text style={styles.errorText}>{errors.description.message}</Text>
                        )}
                      </View>
                    )}
                  />
                );
              case 'category':
                return (
                  <Controller
                    control={control}
                    name="category"
                    render={({ field: { onChange, value } }) => (
                      <SimpleDropdown
                        label="Category"
                        placeholder="Select category"
                        options={categoryOptions}
                        value={value}
                        onSelect={(option) => onChange(option.value)}
                        error={errors.category?.message}
                        containerStyle={styles.inputContainer}
                      />
                    )}
                  />
                );
              case 'priority':
                return (
                  <Controller
                    control={control}
                    name="priority"
                    render={({ field: { onChange, value } }) => (
                      <CustomPriorityStatus
                        label="Priority"
                        options={priorityOptions}
                        value={value}
                        onValueChange={onChange}
                        error={errors.priority?.message}
                        containerStyle={styles.inputContainer}
                      />
                    )}
                  />
                );
              case 'status':
                return (
                  <Controller
                    control={control}
                    name="status"
                    render={({ field: { onChange, value } }) => (
                      <CustomPriorityStatus
                        label="Status"
                        options={statusOptions}
                        value={value}
                        onValueChange={onChange}
                        error={errors.status?.message}
                        containerStyle={styles.inputContainer}
                      />
                    )}
                  />
                );
              case 'dueDate':
                return (
                  <Controller
                    control={control}
                    name="dueDate"
                    render={({ field: { onChange, value } }) => (
                      <CustomDatePicker
                        label="Due Date"
                        placeholder="Select due date"
                        value={value}
                        onDateChange={onChange}
                        mode="date"
                        error={errors.dueDate?.message}
                        containerStyle={styles.inputContainer}
                      />
                    )}
                  />
                );
              case 'createdDate':
                return (
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
                );
              default:
                return null;
            }
          }}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>

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
            onPress={handleSubmit(onSubmit)}
            variant="gradient"
            size="large"
            containerStyle={styles.createButton}
            loading={createTaskMutation.isPending}
            disabled={createTaskMutation.isPending}
          />
        </View>
      </View>

      {/* Toast Notification */}
      <CustomToaster
        visible={toastMessage !== null}
        message={toastMessage || ''}
        type={createTaskMutation.isError ? 'error' : 'success'}
        onHide={() => setToastMessage(null)}
      />
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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
