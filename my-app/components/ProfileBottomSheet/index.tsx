import { useAuth, useLogout, useUpdateEmail } from '@/api/auth';
import { CustomButton } from '@/components/CustomButton';
import { CustomToaster } from '@/components/CustomToaster';
import { capitalizeUsername, getUsernameFromEmail } from '@/utils/username';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export interface ProfileBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (email: string) => void;
}

export const ProfileBottomSheet: React.FC<ProfileBottomSheetProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { data: user } = useAuth();
  const logoutMutation = useLogout();
  const updateEmailMutation = useUpdateEmail();
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Update email when user changes
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  const handleEditEmail = () => {
    setIsEditingEmail(true);
  };

  const handleSave = async () => {
    if (!user?.id) {
      setToastMessage('User not found');
      return;
    }

    if (!email || email.trim() === '') {
      setToastMessage('Email cannot be empty');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setToastMessage('Please enter a valid email address');
      return;
    }

    // Check if email changed
    if (email === user.email) {
      setIsEditingEmail(false);
      return;
    }

    try {
      await updateEmailMutation.mutateAsync({
        userId: user.id,
        newEmail: email.trim(),
      });
      
      setIsEditingEmail(false);
      setToastMessage('Email updated successfully');
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(email.trim());
      }
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Failed to update email');
    }
  };

  const handleCancel = () => {
    setEmail(user?.email || '');
    setIsEditingEmail(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
  };

  const handleClose = () => {
    if (isEditingEmail) {
      handleCancel();
    }
    onClose();
  };

  const username = user?.email ? capitalizeUsername(getUsernameFromEmail(user.email)) : 'User';
  const displayName = user?.name || username;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.sheetContainer}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>

            {!isEditingEmail ? (
              // Profile View
              <>
                {/* Profile Icon */}
                <View style={styles.profileIconContainer}>
                  <View style={styles.profileIcon}>
                    <Ionicons name="person" size={40} color="#8B5CF6" />
                  </View>
                </View>

                {/* User Name */}
                <Text style={styles.userName}>{displayName}</Text>

                {/* Email Display */}
                <View style={styles.emailDisplayContainer}>
                  <Ionicons name="mail-outline" size={18} color="#6B7280" style={styles.emailIcon} />
                  <Text style={styles.emailText}>{user?.email || ''}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={styles.editEmailButton}
                    onPress={handleEditEmail}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.editEmailText}>Edit Email</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.logoutIcon} />
                    <Text style={styles.logoutText}>Log Out</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Edit Email View
              <>
                {/* Profile Icon */}
                <View style={styles.profileIconContainer}>
                  <View style={styles.profileIcon}>
                    <Ionicons name="person" size={40} color="#8B5CF6" />
                  </View>
                </View>

                {/* User Name */}
                <Text style={styles.userName}>{displayName}</Text>

                {/* Email Input */}
                <View style={styles.emailInputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.emailInputIcon} />
                  <TextInput
                    style={styles.emailInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoFocus
                  />
                </View>

                {/* Cancel and Save Buttons - 50-50 split */}
                <View style={styles.editButtonsContainer}>
                  <View style={styles.buttonWrapper}>
                    <CustomButton
                      title="Cancel"
                      onPress={handleCancel}
                      variant="outline"
                      size="large"
                      containerStyle={styles.cancelButton}
                    />
                  </View>
                  <View style={styles.buttonWrapper}>
                    <CustomButton
                      title="Save"
                      onPress={handleSave}
                      variant="gradient"
                      size="large"
                      containerStyle={styles.saveButton}
                      disabled={updateEmailMutation.isPending}
                    />
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      <CustomToaster
        visible={toastMessage !== null}
        message={toastMessage || ''}
        type={updateEmailMutation.isError ? 'error' : 'success'}
        onHide={() => setToastMessage(null)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  emailDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emailIcon: {
    marginRight: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#6B7280',
  },
  actionButtonsContainer: {
    gap: 12,
  },
  editEmailButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editEmailText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutIcon: {
    marginRight: 0,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    marginBottom: 24,
  },
  emailInputIcon: {
    marginRight: 12,
  },
  emailInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  cancelButton: {
    width: '100%',
  },
  saveButton: {
    width: '100%',
  },
});
