import { useAuth } from '@/api/auth';
import { CustomButton } from '@/components/CustomButton';
import { capitalizeUsername, getUsernameFromEmail } from '@/utils/username';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function WelcomeScreen() {
  const { data: user } = useAuth();
  const username = user?.email ? capitalizeUsername(getUsernameFromEmail(user.email)) : 'User';

  const handleGoToDashboard = () => {
    router.replace('/(tabs)');
  };

  return (
    <FlatList
      data={[{ type: 'content', key: 'content' }]}
      renderItem={() => (
        <View style={styles.content}>
          {/* Icon with gradient and decorative circles */}
          <View style={styles.iconSection}>
            <View style={styles.decorativeCircles}>
              {/* Orange circle */}
              <View style={[styles.circle, styles.orangeCircle]} />
              {/* Pink circle */}
              <View style={[styles.circle, styles.pinkCircle]} />
              {/* Green circle */}
              <View style={[styles.circle, styles.greenCircle]} />
            </View>
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name="star" size={40} color="#fff" />
              <View style={styles.plusIcon}>
                <Ionicons name="add" size={16} color="#fff" />
              </View>
            </LinearGradient>
          </View>

          {/* Welcome Message */}
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>
              Hello, {username}! <Text style={styles.emoji}>👋</Text>
            </Text>
            <Text style={styles.message}>
              Let's complete your tasks today and{'\n'}
              make it a productive day!
            </Text>
          </View>

          {/* Go to Dashboard Button */}
          <View style={styles.buttonSection}>
            <CustomButton
              title="Go to Dashboard"
              onPress={handleGoToDashboard}
              variant="gradient"
              size="large"
              fullWidth
              containerStyle={styles.dashboardButton}
              rightIcon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
            />
          </View>
        </View>
      )}
      keyExtractor={(item) => item.key}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  decorativeCircles: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  circle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  orangeCircle: {
    backgroundColor: '#FF6B35',
    top: 20,
    right: 40,
  },
  pinkCircle: {
    backgroundColor: '#FF6B9D',
    top: 60,
    right: 20,
  },
  greenCircle: {
    backgroundColor: '#10B981',
    bottom: 30,
    left: 30,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  plusIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonSection: {
    width: '100%',
    marginTop: 24,
  },
  dashboardButton: {
    marginTop: 0,
  },
});
