import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as LocalAuthentication from "expo-local-authentication";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { LockIcon } from "@/components/LockIcon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { getLockedApps, getIsAllLocked, setIsAllLocked } from "@/lib/storage";

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LockToggleScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: isLocked = false } = useQuery({
    queryKey: ["isAllLocked"],
    queryFn: getIsAllLocked,
  });

  const { data: apps = [] } = useQuery({
    queryKey: ["apps"],
    queryFn: getLockedApps,
  });

  const lockedCount = apps.filter((app) => app.isLocked).length;

  const toggleMutation = useMutation({
    mutationFn: async (newLocked: boolean) => {
      await setIsAllLocked(newLocked);
      return newLocked;
    },
    onSuccess: (newLocked) => {
      queryClient.setQueryData(["isAllLocked"], newLocked);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);

      if (newLocked) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = useCallback(async () => {
    if (Platform.OS === "web") {
      toggleMutation.mutate(!isLocked);
      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: isLocked ? "Unlock all apps" : "Lock all apps",
        fallbackLabel: "Use PIN",
        disableDeviceFallback: false,
      });

      if (result.success) {
        toggleMutation.mutate(!isLocked);
      }
    } else {
      toggleMutation.mutate(!isLocked);
    }
  }, [isLocked, toggleMutation]);

  return (
    <Pressable
      onPress={handleToggle}
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
    >
      <View style={styles.timeContainer}>
        <ThemedText type="h2" style={styles.time}>
          {formatTime(currentTime)}
        </ThemedText>
        <ThemedText type="small" style={[styles.date, { color: theme.textSecondary }]}>
          {currentTime.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </ThemedText>
      </View>

      <View style={styles.centerContent}>
        <LockIcon isLocked={isLocked} size={140} animating={isAnimating} />

        <ThemedText
          type="h3"
          style={[
            styles.status,
            { color: isLocked ? theme.success : theme.textSecondary },
          ]}
        >
          {isLocked ? "Apps Locked" : "Apps Unlocked"}
        </ThemedText>

        <ThemedText type="body" style={[styles.count, { color: theme.textSecondary }]}>
          {lockedCount} app{lockedCount !== 1 ? "s" : ""} protected
        </ThemedText>
      </View>

      <View style={styles.bottomContent}>
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          Tap anywhere to {isLocked ? "unlock" : "lock"}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  timeContainer: {
    alignItems: "center",
    marginTop: Spacing["2xl"],
  },
  time: {
    fontWeight: "300",
    fontSize: 48,
  },
  date: {
    marginTop: Spacing.xs,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  status: {
    marginTop: Spacing["2xl"],
    fontWeight: "600",
  },
  count: {
    marginTop: Spacing.sm,
  },
  bottomContent: {
    alignItems: "center",
    paddingBottom: Spacing.xl,
  },
  hint: {
    opacity: 0.7,
  },
});
