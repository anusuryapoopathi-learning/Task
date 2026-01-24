import { useTask, useUpdateTask } from '@/api/tasks';
import { CustomToaster } from '@/components/CustomToaster';
import { TaskFormField } from '@/components/FormFields';
import { TaskFormFooter } from '@/components/TaskFormFooter';
import { TASK_FORM_FIELDS } from '@/constants/taskFormFields';
import type { CreateTaskInput } from '@/zod/TastCreateZod/createTask';
import { createTaskSchema } from '@/zod/TastCreateZod/createTask';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Map category values to display names
const categoryMap: Record<string, string> = {
  'Work': 'work',
  'Personal': 'personal',
  'Interview Preparation': 'interview',
  'Health & Fitness': 'health',
  'Learning': 'learning',
};

const reverseCategoryMap: Record<string, string> = {
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
      const categoryValue = categoryMap[task.category || ''] || task.category || '';
      const dueDateObj = task.dueDate
        ? task.dueDate instanceof Date
          ? task.dueDate
          : new Date(task.dueDate)
        : new Date();
      const createdDateObj = task.createdDate
        ? task.createdDate instanceof Date
          ? task.createdDate
          : new Date(task.createdDate)
        : dueDateObj
        ? new Date(dueDateObj.getTime() - 24 * 60 * 60 * 1000)
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

  const onSubmit = (data: CreateTaskInput) => {
    if (!params.taskId) return;

    // Don't update createdDate - keep the original
    updateTaskMutation.mutate({
      id: params.taskId,
      title: data.title,
      description: data.description,
      category: reverseCategoryMap[data.category] || data.category,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      // createdDate should NOT be updated - it's read-only
    });
  };

  const handleCancel = () => {
    router.back();
  };

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

  // Track form changes to conditionally show save button
  const [initialValues, setInitialValues] = useState<CreateTaskInput | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Store initial values when task is loaded
  useEffect(() => {
    if (task && !initialValues) {
      const categoryValue = categoryMap[task.category || ''] || task.category || '';
      const dueDateObj = task.dueDate
        ? task.dueDate instanceof Date
          ? task.dueDate
          : new Date(task.dueDate)
        : new Date();
      const createdDateObj = task.createdDate
        ? task.createdDate instanceof Date
          ? task.createdDate
          : new Date(task.createdDate)
        : dueDateObj
        ? new Date(dueDateObj.getTime() - 24 * 60 * 60 * 1000)
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
          const initialDate = initialValue instanceof Date ? initialValue : new Date(initialValue);
          const currentDate = currentValue instanceof Date ? currentValue : new Date(currentValue);
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
