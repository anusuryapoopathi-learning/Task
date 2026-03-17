import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { CustomToaster } from '@/components/CustomToaster';
import { useAuthContext } from '@/contexts/AuthContext';
import { signupZodSchema } from '@/zod/signupZod/signupZod';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signup } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSignup = async () => {
    setErrors({});

    try {
      const validated = signupZodSchema.parse({ name, email, password, confirmPassword });
      setIsSubmitting(true);
      await signup({
        name: validated.name,
        email: validated.email,
        password: validated.password,
      });

      setToast({ message: 'Signup successful. Please login.', type: 'success' });
      router.replace('/auth/login');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: typeof errors = {};
        error.issues.forEach((err) => {
          const field = err.path[0];
          if (field === 'name') fieldErrors.name = err.message;
          if (field === 'email') fieldErrors.email = err.message;
          if (field === 'password') fieldErrors.password = err.message;
          if (field === 'confirmPassword') fieldErrors.confirmPassword = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      const authError = error as { message?: string };
      setToast({ message: authError.message || 'Signup failed', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 20}
      >
        <FlatList
          data={[{ type: 'content', key: 'content' }]}
          renderItem={() => (
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#8B5CF6', '#3B82F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Ionicons name="person-add" size={36} color="#fff" />
                </LinearGradient>
              </View>

              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to start managing your tasks</Text>
              </View>

              <View style={styles.form}>
                <CustomInput
                  label="Name"
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={(text: string) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  autoCapitalize="words"
                  editable={!isSubmitting}
                  error={errors.name}
                  containerStyle={styles.inputContainer}
                />

                <CustomInput
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text: string) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isSubmitting}
                  error={errors.email}
                  containerStyle={styles.inputContainer}
                />

                <CustomInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text: string) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  secureTextEntry
                  showPasswordToggle
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!isSubmitting}
                  error={errors.password}
                  containerStyle={styles.inputContainer}
                />

                <CustomInput
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={(text: string) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  secureTextEntry
                  showPasswordToggle
                  autoCapitalize="none"
                  editable={!isSubmitting}
                  error={errors.confirmPassword}
                  containerStyle={styles.inputContainer}
                />

                <CustomButton
                  title="Sign Up"
                  onPress={handleSignup}
                  variant="gradient"
                  size="large"
                  fullWidth
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  containerStyle={styles.signUpButton}
                />
              </View>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/auth/login')} disabled={isSubmitting}>
                  <Text style={styles.loginLink}>Go to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: Math.max(insets.bottom, 40) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>

      <CustomToaster
        visible={toast !== null}
        message={toast?.message || ''}
        type={toast?.type || 'success'}
        duration={3000}
        onHide={() => setToast(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 18,
  },
  signUpButton: {
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
