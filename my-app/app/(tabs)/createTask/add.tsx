import { useCreateTask } from '@/api/tasks';
import { CustomToaster } from '@/components/CustomToaster';
import { TaskFormField } from '@/components/FormFields';
import { TaskFormFooter } from '@/components/TaskFormFooter';
import { DEFAULT_PRIORITY, DEFAULT_STATUS } from '@/constants/defaultValues';
import { TASK_FORM_FIELDS } from '@/constants/taskFormFields';
import {
    CATEGORY_MAP_TO_DISPLAY,
    CATEGORY_OPTIONS,
    PRIORITY_OPTIONS,
    STATUS_OPTIONS,
} from '@/constants/taskOptions';
import { formatDateToUK, getTodayStartOfDay } from '@/utils/dateFormatter';
import type { CreateTaskInput } from '@/zod/TastCreateZod/createTask';
import { createTaskSchema } from '@/zod/TastCreateZod/createTask';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

export default function CreateTaskScreen() {
  const insets = useSafeAreaInsets();
  const createTaskMutation = useCreateTask();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const defaultFormValues = useMemo<CreateTaskInput>(() => ({
    title: '',
    description: '',
    category: '',
    priority: DEFAULT_PRIORITY,
    status: DEFAULT_STATUS,
    dueDate: new Date(),
    createdDate: new Date(),
  }), []);

  const methods = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: defaultFormValues,
  });

  const { handleSubmit, reset } = methods;

  // Clear form when screen is focused
  useFocusEffect(
    useCallback(() => {
      reset(defaultFormValues);
    }, [reset, defaultFormValues])
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

  const onSubmit = useCallback((data: CreateTaskInput) => {
    createTaskMutation.mutate({
      title: data.title,
      description: data.description,
      category: CATEGORY_MAP_TO_DISPLAY[data.category] || data.category,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      createdDate: data.createdDate || new Date(),
    });
  }, [createTaskMutation]);

  const handleCancel = useCallback(() => {
    router.replace('/(tabs)');
  }, []);

  const createdDateFormatter = useCallback((value: Date | string | null | undefined): string => {
    return formatDateToUK(value);
  }, []);

  // Set minimum date to today (prevent selecting past dates)
  const today = useMemo(() => getTodayStartOfDay(), []);

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
                categoryOptions={CATEGORY_OPTIONS}
                priorityOptions={PRIORITY_OPTIONS}
                statusOptions={STATUS_OPTIONS}
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
