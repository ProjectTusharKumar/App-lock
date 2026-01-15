import React from "react";
import { StyleSheet, View, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface SettingsRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
  showChevron?: boolean;
  iconColor?: string;
  danger?: boolean;
}

export function SettingsRow({
  icon,
  label,
  value,
  isSwitch = false,
  switchValue = false,
  onPress,
  onSwitchChange,
  showChevron = false,
  iconColor,
  danger = false,
}: SettingsRowProps) {
  const { theme } = useTheme();

  const handleSwitchChange = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwitchChange?.(val);
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const textColor = danger ? theme.error : theme.text;
  const finalIconColor = iconColor || (danger ? theme.error : theme.primary);

  return (
    <Pressable
      onPress={handlePress}
      disabled={isSwitch && !onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pressed && onPress ? theme.backgroundSecondary : "transparent" },
      ]}
      testID={`setting-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name={icon} size={18} color={finalIconColor} />
      </View>
      <View style={styles.labelContainer}>
        <ThemedText type="body" style={[styles.label, { color: textColor }]}>
          {label}
        </ThemedText>
      </View>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={handleSwitchChange}
          trackColor={{ false: theme.border, true: theme.success }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={theme.border}
        />
      ) : (
        <>
          {value ? (
            <ThemedText type="small" style={[styles.value, { color: theme.textSecondary }]}>
              {value}
            </ThemedText>
          ) : null}
          {showChevron ? (
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontWeight: "400",
  },
  value: {
    marginRight: Spacing.sm,
  },
});
