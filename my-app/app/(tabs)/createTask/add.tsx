import { useCreateTask } from '@/api/tasks';
import { CustomToaster } from '@/components/CustomToaster';
import { TaskFormField } from '@/components/FormFields';
import { TaskFormFooter } from '@/components/TaskFormFooter';
import { TASK_FORM_FIELDS } from '@/constants/taskFormFields';
import type { CreateTaskInput } from '@/zod/TastCreateZod/createTask';
import { createTaskSchema } from '@/zod/TastCreateZod/createTask';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './styles';

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

  const methods = useForm<CreateTaskInput>({
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

  const { handleSubmit, reset } = methods;

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

  const createdDateFormatter = (value: any) => {
    const date = value instanceof Date ? value : new Date(value || new Date());
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Set minimum date to today (prevent selecting past dates)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <FormProvider {...methods}>
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
            data={TASK_FORM_FIELDS}
            renderItem={({ item }) => (
              <TaskFormField
                type={item.type}
                name={item.key}
                categoryOptions={categoryOptions}
                priorityOptions={priorityOptions}
                statusOptions={statusOptions}
                createdDateFormatter={createdDateFormatter}
                dueDateMinimumDate={item.type === 'dueDate' ? today : undefined}
                containerStyle={styles.inputContainer}
              />
            )}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </KeyboardAvoidingView>

        {/* Sticky Footer Buttons */}
        <TaskFormFooter
          onCancel={handleCancel}
          onSubmit={handleSubmit(onSubmit)}
          submitTitle="Create Task"
          isLoading={createTaskMutation.isPending}
          isDisabled={createTaskMutation.isPending}
          bottomInset={insets.bottom}
        />

        {/* Toast Notification */}
        <CustomToaster
          visible={toastMessage !== null}
          message={toastMessage || ''}
          type={createTaskMutation.isError ? 'error' : 'success'}
          onHide={() => setToastMessage(null)}
        />
      </View>
    </FormProvider>
  );
}
