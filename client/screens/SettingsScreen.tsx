import React from "react";
import { StyleSheet, View, ScrollView, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { SettingsSection } from "@/components/SettingsSection";
import { SettingsRow } from "@/components/SettingsRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getSecuritySettings, saveSecuritySettings, getAuthConfig } from "@/lib/storage";
import { SecuritySettings } from "@/types/app";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["securitySettings"],
    queryFn: getSecuritySettings,
  });

  const { data: authConfig } = useQuery({
    queryKey: ["authConfig"],
    queryFn: getAuthConfig,
  });

  const settingsMutation = useMutation({
    mutationFn: saveSecuritySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["securitySettings"] });
    },
  });

  const updateSetting = <K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K]
  ) => {
    if (settings) {
      settingsMutation.mutate({ ...settings, [key]: value });
    }
  };

  const getLockTimeoutLabel = (timeout: number) => {
    if (timeout === 0) return "Immediately";
    if (timeout === 30) return "30 seconds";
    if (timeout === 60) return "1 minute";
    if (timeout === 300) return "5 minutes";
    return `${timeout}s`;
  };

  const handleChangePIN = () => {
    navigation.navigate("AuthSetup", { mode: "change" });
  };

  const handleViewIntruderLogs = () => {
    navigation.navigate("IntruderLogs");
  };

  const handleRecoveryEmail = () => {
    if (Platform.OS === "web") {
      Alert.alert("Recovery Email", "Enter your recovery email in the app on your device.");
      return;
    }
    Alert.prompt(
      "Recovery Email",
      "Enter your recovery email address",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (email) => {
            if (email && settings) {
              updateSetting("recoveryEmail", email);
            }
          },
        },
      ],
      "plain-text",
      settings?.recoveryEmail || ""
    );
  };

  const handleLockTimeout = () => {
    Alert.alert(
      "Lock Timeout",
      "Choose how long to wait before requiring authentication again",
      [
        { text: "Immediately", onPress: () => updateSetting("lockTimeout", 0) },
        { text: "30 seconds", onPress: () => updateSetting("lockTimeout", 30) },
        { text: "1 minute", onPress: () => updateSetting("lockTimeout", 60) },
        { text: "5 minutes", onPress: () => updateSetting("lockTimeout", 300) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <SettingsSection title="Authentication">
        <SettingsRow
          icon="key"
          label="Change PIN"
          onPress={handleChangePIN}
          showChevron
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingsRow
          icon="smartphone"
          label="Biometric Unlock"
          isSwitch
          switchValue={authConfig?.biometricEnabled || false}
          onSwitchChange={() => {}}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingsRow
          icon="clock"
          label="Lock Timeout"
          value={getLockTimeoutLabel(settings?.lockTimeout || 0)}
          onPress={handleLockTimeout}
          showChevron
        />
      </SettingsSection>

      <SettingsSection title="Security">
        <SettingsRow
          icon="camera-off"
          label="Screenshot Prevention"
          isSwitch
          switchValue={settings?.screenshotPrevention || false}
          onSwitchChange={(value) => updateSetting("screenshotPrevention", value)}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingsRow
          icon="shield"
          label="Root Detection"
          isSwitch
          switchValue={settings?.rootDetection || false}
          onSwitchChange={(value) => updateSetting("rootDetection", value)}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingsRow
          icon="trash-2"
          label="Uninstall Protection"
          isSwitch
          switchValue={settings?.uninstallProtection || false}
          onSwitchChange={(value) => updateSetting("uninstallProtection", value)}
        />
      </SettingsSection>

      <SettingsSection title="Intruder Detection">
        <SettingsRow
          icon="alert-triangle"
          label="Enable Alerts"
          isSwitch
          switchValue={settings?.intruderDetection || false}
          onSwitchChange={(value) => updateSetting("intruderDetection", value)}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingsRow
          icon="eye"
          label="View Intruder Logs"
          onPress={handleViewIntruderLogs}
          showChevron
        />
      </SettingsSection>

      <SettingsSection title="Recovery">
        <SettingsRow
          icon="mail"
          label="Recovery Email"
          value={settings?.recoveryEmail || "Not set"}
          onPress={handleRecoveryEmail}
          showChevron
        />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsRow
          icon="info"
          label="Version"
          value="1.0.0"
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingsRow
          icon="star"
          label="Upgrade to Premium"
          onPress={() => {}}
          showChevron
          iconColor="#FFD700"
        />
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginLeft: Spacing.lg + 32 + Spacing.md,
  },
});
