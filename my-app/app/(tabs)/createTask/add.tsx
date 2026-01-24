import { useCreateTask } from '@/api/tasks';
import { ConfirmDialog } from '@/components/ConfirmDialog';
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
import { formatDateToUK, getTodayStartOfDay, normalizeDate } from '@/utils/dateFormatter';
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
      reset(defaultFormValues); // Auto-reset form after success
      setHasChanges(false); // Reset changes flag
    }
  }, [createTaskMutation.isSuccess, createTaskMutation.data, reset, defaultFormValues]);

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
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      router.replace('/(tabs)');
    }
  }, [hasChanges]);

  const handleBackButton = useCallback(() => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      router.replace('/(tabs)');
    }
  }, [hasChanges]);

  const handleConfirmDiscard = useCallback(() => {
    setShowConfirmDialog(false);
    // Reset form to default values before navigating back
    reset(defaultFormValues);
    setHasChanges(false);
    router.replace('/(tabs)');
  }, [defaultFormValues, reset]);

  const handleCancelDiscard = useCallback(() => {
    setShowConfirmDialog(false);
  }, []);

  const createdDateFormatter = useCallback((value: unknown): string => {
    return formatDateToUK(value as Date | string | null | undefined);
  }, []);

  // Track form changes by comparing with default values
  const formValues = methods.watch();
  useEffect(() => {
    const hasFormChanges = Object.keys(defaultFormValues).some((key) => {
      const formKey = key as keyof CreateTaskInput;
      const defaultValue = defaultFormValues[formKey];
      const currentValue = formValues[formKey];

      // Special handling for dates
      if (formKey === 'dueDate' || formKey === 'createdDate') {
        const defaultDate = normalizeDate(defaultValue as Date | string | null | undefined);
        const currentDate = normalizeDate(currentValue as Date | string | null | undefined);
        return defaultDate.getTime() !== currentDate.getTime();
      }

      // Check if field has been filled (not empty/default)
      if (formKey === 'title' || formKey === 'description') {
        return (currentValue as string)?.trim() !== '';
      }

      if (formKey === 'category') {
        return (currentValue as string) !== '';
      }

      return defaultValue !== currentValue;
    });
    setHasChanges(hasFormChanges);
  }, [formValues, defaultFormValues]);

  // Set minimum date to today (prevent selecting past dates)
  const today = useMemo(() => getTodayStartOfDay(), []);

  return (
    <FormProvider {...methods}>
      <View style={styles.container}>
        {/* Sticky Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
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

        {/* Confirm Dialog */}
        <ConfirmDialog
          visible={showConfirmDialog}
          message="Are you sure want to leave this screen? Your changes won't save yet"
          onConfirm={handleConfirmDiscard}
          onCancel={handleCancelDiscard}
          confirmText="OK"
          cancelText="Cancel"
        />
      </View>
    </FormProvider>
  );
}
