import React from "react";
import { StyleSheet, View, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppInfo } from "@/types/app";

interface AppListItemProps {
  app: AppInfo;
  onToggle: (isLocked: boolean) => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AppListItem({ app, onToggle }: AppListItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handleToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(value);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
      testID={`app-item-${app.id}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather
          name={app.icon as any}
          size={24}
          color={app.isLocked ? theme.lockActive : theme.textSecondary}
        />
        {app.isLocked ? (
          <View style={[styles.lockBadge, { backgroundColor: theme.success }]}>
            <Feather name="lock" size={10} color="#FFFFFF" />
          </View>
        ) : null}
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="body" style={styles.appName}>
          {app.name}
        </ThemedText>
        <ThemedText
          type="small"
          style={[styles.category, { color: theme.textSecondary }]}
        >
          {app.category}
        </ThemedText>
      </View>
      <Switch
        value={app.isLocked}
        onValueChange={handleToggle}
        trackColor={{ false: theme.border, true: theme.success }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={theme.border}
        testID={`switch-${app.id}`}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    position: "relative",
  },
  lockBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  appName: {
    fontWeight: "500",
  },
  category: {
    marginTop: 2,
  },
});
