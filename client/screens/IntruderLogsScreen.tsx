import React, { useCallback } from "react";
import { StyleSheet, View, FlatList, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { IntruderLogItem } from "@/components/IntruderLogItem";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { IntruderLog } from "@/types/app";
import { getIntruderLogs, clearIntruderLogs, addIntruderLog } from "@/lib/storage";

export default function IntruderLogsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["intruderLogs"],
    queryFn: getIntruderLogs,
  });

  const clearMutation = useMutation({
    mutationFn: clearIntruderLogs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intruderLogs"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const addDemoMutation = useMutation({
    mutationFn: () =>
      addIntruderLog({
        timestamp: Date.now() - Math.random() * 86400000,
        failedAttempts: Math.floor(Math.random() * 5) + 1,
        appName: ["Photos", "Banking", "Messages", "WhatsApp"][Math.floor(Math.random() * 4)],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intruderLogs"] });
    },
  });

  const handleClearLogs = () => {
    Alert.alert(
      "Clear All Logs",
      "Are you sure you want to delete all intruder logs? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => clearMutation.mutate(),
        },
      ]
    );
  };

  const handleLogPress = useCallback((log: IntruderLog) => {
    Alert.alert(
      "Intruder Details",
      `${log.failedAttempts} failed attempt${log.failedAttempts > 1 ? "s" : ""}\n\nTime: ${new Date(log.timestamp).toLocaleString()}${log.appName ? `\nApp: ${log.appName}` : ""}`,
      [{ text: "OK" }]
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: IntruderLog }) => (
      <IntruderLogItem log={item} onPress={() => handleLogPress(item)} />
    ),
    [handleLogPress]
  );

  const ListEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <EmptyState
            image={require("../../assets/images/empty-intruder-logs.png")}
            title="Loading..."
            description="Fetching intruder logs"
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          image={require("../../assets/images/empty-intruder-logs.png")}
          title="No Intruders Detected"
          description="When someone tries to access your locked apps with the wrong PIN, they'll appear here."
        />
        <Button
          onPress={() => addDemoMutation.mutate()}
          style={styles.demoButton}
        >
          Add Demo Log
        </Button>
      </View>
    );
  };

  const ListFooter = () => {
    if (logs.length === 0) return null;

    return (
      <View style={styles.footer}>
        <Button
          onPress={handleClearLogs}
          style={[styles.clearButton, { backgroundColor: theme.error }]}
        >
          Clear All Logs
        </Button>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        style={styles.list}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={logs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  demoButton: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing["2xl"],
  },
  footer: {
    paddingTop: Spacing.xl,
  },
  clearButton: {
    width: "100%",
  },
});
