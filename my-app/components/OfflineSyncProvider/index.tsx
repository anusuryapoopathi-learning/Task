import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { CustomToaster } from '@/components/CustomToaster';
import { getPendingMutationsCount } from '@/services/offlineQueue';

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, isOffline } = useNetworkStatus();
  const { isSyncing, lastSyncTime } = useOfflineSync();
  const [pendingCount, setPendingCount] = useState(0);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Update pending count
  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await getPendingMutationsCount();
      setPendingCount(count);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Show offline toast when going offline
  useEffect(() => {
    if (isOffline && !wasOffline) {
      setShowOfflineToast(true);
      setWasOffline(true);
    }
  }, [isOffline, wasOffline]);

  // Show online toast when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowOnlineToast(true);
      setWasOffline(false);
    }
  }, [isOnline, wasOffline]);

  // Show sync toast after sync completes
  useEffect(() => {
    if (lastSyncTime && !isSyncing && pendingCount === 0 && wasOffline) {
      setShowSyncToast(true);
      // Reset wasOffline after showing sync toast
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSyncTime, isSyncing, pendingCount, wasOffline]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      
      {/* Offline Banner */}
      <OfflineIndicator visible={isOffline} pendingCount={pendingCount} />

      {/* Offline Toast */}
      <CustomToaster
        visible={showOfflineToast}
        message="You are offline. Changes will sync when you're back online."
        type="warning"
        duration={4000}
        onHide={() => setShowOfflineToast(false)}
      />

      {/* Online Toast */}
      <CustomToaster
        visible={showOnlineToast}
        message="Back online! Syncing your changes..."
        type="info"
        duration={3000}
        onHide={() => setShowOnlineToast(false)}
      />

      {/* Sync Complete Toast */}
      <CustomToaster
        visible={showSyncToast}
        message={`All changes synced successfully!`}
        type="success"
        duration={3000}
        onHide={() => setShowSyncToast(false)}
      />
    </View>
  );
}
