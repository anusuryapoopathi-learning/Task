import { useTask, useUpdateTask } from '@/api/tasks';
import { CustomToaster } from '@/components/CustomToaster';
import { TaskFormField } from '@/components/FormFields';
import { TaskFormFooter } from '@/components/TaskFormFooter';
import { MILLISECONDS_PER_DAY } from '@/constants/defaultValues';
import { TASK_FORM_FIELDS } from '@/constants/taskFormFields';
import {
    CATEGORY_MAP_REVERSE,
    CATEGORY_MAP_TO_FORM,
    CATEGORY_OPTIONS,
    PRIORITY_OPTIONS,
    STATUS_OPTIONS,
} from '@/constants/taskOptions';
import { formatDateToUK, getTodayStartOfDay, normalizeDate } from '@/utils/dateFormatter';
import type { CreateTaskInput } from '@/zod/TastCreateZod/createTask';
import { createTaskSchema } from '@/zod/TastCreateZod/createTask';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './styles';

export default function EditTaskScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ taskId: string }>();
  const { data: task, isLoading } = useTask(params.taskId || '');
  const updateTaskMutation = useUpdateTask();
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

  // Load task data when task is fetched
  useEffect(() => {
    if (task) {
      const categoryValue = CATEGORY_MAP_TO_FORM[task.category || ''] || task.category || '';
      const dueDateObj = normalizeDate(task.dueDate);
      const createdDateObj = task.createdDate
        ? normalizeDate(task.createdDate)
        : dueDateObj
        ? new Date(dueDateObj.getTime() - MILLISECONDS_PER_DAY)
        : new Date();

      reset({
        title: task.title,
        description: task.description || '',
        category: categoryValue,
        priority: task.priority,
        status: task.status,
        dueDate: dueDateObj,
        createdDate: createdDateObj,
      });
    }
  }, [task, reset]);

  // Handle mutation success/error for toast notifications
  useEffect(() => {
    if (updateTaskMutation.isSuccess && updateTaskMutation.data) {
      setToastMessage('Task updated successfully!');
      // Reset form changes tracking after successful update
      setHasChanges(false);
      // Update initial values to current form values
      const currentValues = methods.getValues();
      setInitialValues(currentValues);
    }
  }, [updateTaskMutation.isSuccess, updateTaskMutation.data, methods]);

  useEffect(() => {
    if (updateTaskMutation.isError) {
      setToastMessage(updateTaskMutation.error?.message || 'Failed to update task');
    }
  }, [updateTaskMutation.isError, updateTaskMutation.error]);

  const onSubmit = useCallback((data: CreateTaskInput) => {
    if (!params.taskId) return;

    // Don't update createdDate - keep the original
    updateTaskMutation.mutate({
      id: params.taskId,
      title: data.title,
      description: data.description,
      category: CATEGORY_MAP_REVERSE[data.category] || data.category,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      // createdDate should NOT be updated - it's read-only
    });
  }, [params.taskId, updateTaskMutation]);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Task</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading task...</Text>
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Task</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Task not found</Text>
        </View>
      </View>
    );
  }

  const createdDateFormatter = useCallback((value: Date | string | null | undefined): string => {
    return formatDateToUK(value);
  }, []);

  // Set minimum date to today (prevent selecting past dates)
  const today = useMemo(() => getTodayStartOfDay(), []);

  // Track form changes to conditionally show save button
  const [initialValues, setInitialValues] = useState<CreateTaskInput | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Store initial values when task is loaded
  useEffect(() => {
    if (task && !initialValues) {
      const categoryValue = CATEGORY_MAP_TO_FORM[task.category || ''] || task.category || '';
      const dueDateObj = normalizeDate(task.dueDate);
      const createdDateObj = task.createdDate
        ? normalizeDate(task.createdDate)
        : dueDateObj
        ? new Date(dueDateObj.getTime() - MILLISECONDS_PER_DAY)
        : new Date();

      const initial = {
        title: task.title,
        description: task.description || '',
        category: categoryValue,
        priority: task.priority,
        status: task.status,
        dueDate: dueDateObj,
        createdDate: createdDateObj,
      };
      setInitialValues(initial);
    }
  }, [task, initialValues]);

  // Watch form values and compare with initial values
  const formValues = methods.watch();
  useEffect(() => {
    if (initialValues) {
      const changed = Object.keys(initialValues).some((key) => {
        const formKey = key as keyof CreateTaskInput;
        const initialValue = initialValues[formKey];
        const currentValue = formValues[formKey];

        // Special handling for dates
        if (formKey === 'dueDate' || formKey === 'createdDate') {
          const initialDate = normalizeDate(initialValue as Date | string | null | undefined);
          const currentDate = normalizeDate(currentValue as Date | string | null | undefined);
          return initialDate.getTime() !== currentDate.getTime();
        }

        return initialValue !== currentValue;
      });
      setHasChanges(changed);
    }
  }, [formValues, initialValues]);

  return (
    <FormProvider {...methods}>
      <View style={styles.container}>
        {/* Sticky Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Task</Text>
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
          submitTitle="Save Changes"
          isLoading={updateTaskMutation.isPending}
          isDisabled={updateTaskMutation.isPending}
          showSubmit={hasChanges}
          bottomInset={insets.bottom}
        />

        {/* Toast Notification */}
        <CustomToaster
          visible={toastMessage !== null}
          message={toastMessage || ''}
          type={updateTaskMutation.isError ? 'error' : 'success'}
          onHide={() => setToastMessage(null)}
        />
      </View>
    </FormProvider>
  );
}
