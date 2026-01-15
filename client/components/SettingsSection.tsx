import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText
        type="small"
        style={[styles.title, { color: theme.textSecondary }]}
      >
        {title.toUpperCase()}
      </ThemedText>
      <View
        style={[
          styles.content,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.lg,
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  content: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
});
