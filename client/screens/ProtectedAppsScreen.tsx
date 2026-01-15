import React, { useState, useCallback, useMemo } from "react";
import { StyleSheet, View, FlatList, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { AppListItem } from "@/components/AppListItem";
import { EmptyState } from "@/components/EmptyState";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppInfo } from "@/types/app";
import { getLockedApps, updateAppLockStatus, lockAllApps } from "@/lib/storage";

export default function ProtectedAppsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["apps"],
    queryFn: getLockedApps,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ appId, isLocked }: { appId: string; isLocked: boolean }) =>
      updateAppLockStatus(appId, isLocked),
    onSuccess: (newApps) => {
      queryClient.setQueryData(["apps"], newApps);
    },
  });

  const lockAllMutation = useMutation({
    mutationFn: (lock: boolean) => lockAllApps(lock),
    onSuccess: (newApps) => {
      queryClient.setQueryData(["apps"], newApps);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleToggle = useCallback(
    (app: AppInfo, isLocked: boolean) => {
      toggleMutation.mutate({ appId: app.id, isLocked });
    },
    [toggleMutation]
  );

  const handleLockAll = useCallback(() => {
    const hasUnlocked = apps.some((app) => !app.isLocked);
    lockAllMutation.mutate(hasUnlocked);
  }, [apps, lockAllMutation]);

  const filteredApps = useMemo(() => {
    if (!searchQuery) return apps;
    const query = searchQuery.toLowerCase();
    return apps.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query)
    );
  }, [apps, searchQuery]);

  const lockedApps = useMemo(
    () => filteredApps.filter((app) => app.isLocked),
    [filteredApps]
  );

  const unlockedApps = useMemo(
    () => filteredApps.filter((app) => !app.isLocked),
    [filteredApps]
  );

  const hasUnlockedApps = unlockedApps.length >= 2;
  const fabLabel = apps.some((app) => !app.isLocked) ? "Lock All" : "Unlock All";

  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {title.toUpperCase()}
      </ThemedText>
      <View style={[styles.badge, { backgroundColor: theme.primary }]}>
        <ThemedText type="small" style={styles.badgeText}>
          {count}
        </ThemedText>
      </View>
    </View>
  );

  const renderItem = useCallback(
    ({ item }: { item: AppInfo }) => (
      <AppListItem app={item} onToggle={(isLocked) => handleToggle(item, isLocked)} />
    ),
    [handleToggle]
  );

  const ListHeader = () => (
    <View>
      {showSearch ? (
        <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search apps..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <Pressable onPress={() => { setShowSearch(false); setSearchQuery(""); }}>
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
      ) : null}

      {lockedApps.length > 0 ? (
        <>
          {renderSectionHeader("Protected", lockedApps.length)}
          {lockedApps.map((app) => (
            <AppListItem
              key={app.id}
              app={app}
              onToggle={(isLocked) => handleToggle(app, isLocked)}
            />
          ))}
        </>
      ) : null}

      {unlockedApps.length > 0 ? (
        renderSectionHeader("All Apps", unlockedApps.length)
      ) : null}
    </View>
  );

  const ListEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Loading apps...
          </ThemedText>
        </View>
      );
    }

    if (lockedApps.length === 0 && unlockedApps.length === 0) {
      return (
        <EmptyState
          image={require("../../assets/images/empty-protected-apps.png")}
          title="No Apps Protected"
          description="Tap the toggle next to any app to lock it and keep it safe from prying eyes."
        />
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        style={styles.list}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing["5xl"],
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={unlockedApps}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
      />
      <FloatingActionButton
        icon={apps.some((app) => !app.isLocked) ? "lock" : "unlock"}
        label={fabLabel}
        onPress={handleLockAll}
        visible={apps.length > 0}
      />
    </View>
  );
}

export function ProtectedAppsHeaderRight() {
  const { theme } = useTheme();
  
  return (
    <Pressable
      onPress={() => {}}
      hitSlop={8}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Feather name="search" size={22} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  badge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },
});
