import { useLogin } from '@/api/auth';
import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { CustomToaster } from '@/components/CustomToaster';
import { signinZodSchema } from '@/zod/signinZod/signinZod';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showToast, setShowToast] = useState(false);

  const login = useLogin();

  const handleLogin = async () => {
    // Reset errors
    setErrors({});

    try {
      // Validate with Zod
      const validated = signinZodSchema.parse({ email, password });

      // Attempt login
      await login.mutateAsync(validated);
      
      // Show success toast
      setShowToast(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: { email?: string; password?: string } = {};
        error.issues.forEach((err) => {
          if (err.path[0] === 'email') {
            fieldErrors.email = err.message;
          } else if (err.path[0] === 'password') {
            fieldErrors.password = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        // Handle API errors
        const authError = error as { message?: string };
        Alert.alert('Login Failed', authError.message || 'An error occurred during login');
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: Math.max(insets.bottom, 40) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#8B5CF6', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name="checkmark" size={40} color="#fff" />
          </LinearGradient>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Welcome Back <Text style={styles.emoji}>👋</Text>
          </Text>
          <Text style={styles.subtitle}>
            Sign in to continue managing your tasks
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <CustomInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!login.isPending}
            error={errors.email}
            containerStyle={styles.inputContainer}
          />

          <CustomInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({ ...errors, password: undefined });
              }
            }}
            secureTextEntry
            showPasswordToggle
            autoCapitalize="none"
            autoComplete="password"
            editable={!login.isPending}
            error={errors.password}
            containerStyle={styles.inputContainer}
          />

          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            variant="gradient"
            size="large"
            fullWidth
            loading={login.isPending}
            disabled={login.isPending}
            containerStyle={styles.signInButton}
          />
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => Alert.alert('Sign Up', 'Sign up functionality coming soon')}>
            <Text style={styles.signUpLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast Notification */}
      <CustomToaster
        visible={showToast}
        message="Login successfully"
        type="success"
        duration={3000}
        onHide={() => setShowToast(false)}
      />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
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
    marginBottom: 32,
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
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  signInButton: {
    marginTop: 8,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signUpText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signUpLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
